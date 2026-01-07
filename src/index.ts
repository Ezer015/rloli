import { Elysia, t } from "elysia"
import { openapi } from '@elysiajs/openapi'

const apiHost = "api.lolicon.app"
const endPoint = "/setu/v2"
const proxy = "i.yuki.sh"

const app = new Elysia()
    .use(openapi())
    .get("/", async ({ query, status, redirect }) => {
        const url = new URL(endPoint, `https://${apiHost}`);
        url.search = new URLSearchParams(
            Object.entries(query).filter(([_, v]) => v !== undefined && v !== null)
        ).toString()

        const response = await fetch(url)
        if (!response.ok) {
            return status(response.status, "Upstream API returned an error")
        }

        const payload = await response.json()
        if (payload?.error) {
            return status(502, payload.error)
        }

        const imageUrl = payload?.data?.[0]?.urls?.[query.size]
        if (typeof imageUrl !== "string") {
            return status(502, `No image URL found for size: ${query.size}`)
        }

        const proxyUrl = new URL(imageUrl)
        proxyUrl.host = proxy
        return redirect(proxyUrl.toString())
    }, {
        query: t.Object({
            size: t.Union([
                t.Literal("original"),
                t.Literal("regular"),
                t.Literal("small"),
                t.Literal("thumb"),
                t.Literal("mini"),
            ], { default: "original" }),
            aspectRatio: t.Optional(
                t.String({ pattern: "^((gt|gte|lt|lte|eq)[\\d.]+){1,2}$" }),
            ),
        })
    })
    .get("/h", ({ redirect }) => redirect("/?aspectRatio=gt1"))
    .get("/v", ({ redirect }) => redirect("/?aspectRatio=lt1"))
    .listen(3000)

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)

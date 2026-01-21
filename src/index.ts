import { Elysia, t, file } from "elysia"
import { openapi } from '@elysiajs/openapi'
import { join } from 'path'

const loliconApi = "api.lolicon.app"
const imgEndPoint = "/setu/v2"

const pixivApi = "www.pixiv.net"
const infoEndPoint = "/ajax/illust"

const proxyApi = "i.yuki.sh"

export default new Elysia()
    .use(openapi())
    .get("/static", () => file(join(process.cwd(), 'static', 'index.html')))
    .get("/", async ({ query, status, redirect }) => {
        const url = new URL(imgEndPoint, `https://${loliconApi}`)
        url.search = new URLSearchParams(
            Object.entries({
                size: "original",
                proxy: `/img/{{pid}}/{{p}}?${new URLSearchParams({
                    ...(query.size && { size: query.size }),
                    ...(query.proxy && { proxy: query.proxy }),
                })}`,
                ...(query.aspectRatio && { aspectRatio: query.aspectRatio }),
            })
                .filter(([_, v]) => v !== undefined && v !== null)
        ).toString()

        const response = await fetch(url)
        if (!response.ok) {
            return status(response.status, "Upstream API returned an error")
        }

        const payload = await response.json()
        if (payload?.error) {
            return status(502, payload.error)
        }

        const imgUrl = payload?.data?.at(0)?.urls?.original
        if (typeof imgUrl !== "string") {
            return status(502, `No image URL found`)
        }
        return redirect(imgUrl.replace(/^https:\/\//, ""))

    }, {
        query: t.Object({
            aspectRatio: t.Optional(
                t.String({ pattern: "^((gt|gte|lt|lte|eq)[\\d.]+){1,2}$" }),
            ),
            size: t.Optional(
                t.Union([
                    t.Literal("original"),
                    t.Literal("regular"),
                    t.Literal("small"),
                    t.Literal("thumb_mini"),
                ])
            ),
            proxy: t.Optional(t.String()),
        })
    })
    .get("/h", ({ query, redirect }) => redirect(`/?${new URLSearchParams({
        ...query,
        aspectRatio: "gt1",
    })}`), {
        query: t.Object({
            size: t.Optional(
                t.Union([
                    t.Literal("original"),
                    t.Literal("regular"),
                    t.Literal("small"),
                    t.Literal("thumb_mini"),
                ])
            ),
            proxy: t.Optional(t.String()),
        })
    })
    .get("/v", ({ query, redirect }) => redirect(`/?${new URLSearchParams({
        ...query,
        aspectRatio: "lt1",
    })}`), {
        query: t.Object({
            size: t.Optional(
                t.Union([
                    t.Literal("original"),
                    t.Literal("regular"),
                    t.Literal("small"),
                    t.Literal("thumb_mini"),
                ])
            ),
            proxy: t.Optional(t.String()),
        })
    })
    .get("/img/:id/:page", async ({ params: { id, page }, query, status, redirect }) => {
        const response = await fetch(new URL(`${infoEndPoint}/${id}/pages`, `https://${pixivApi}`))
        if (!response.ok) {
            return status(response.status, "Upstream API returned an error")
        }

        const payload = await response.json()
        if (payload?.error) {
            return status(502, payload.error)
        }

        const base = payload?.body?.at(page)?.urls?.[query.size]
        if (typeof base !== "string") {
            return status(502, `No image URL found for size: ${query.size}`)
        }

        const imageUrl = new URL(base)
        imageUrl.host = query.proxy
        return redirect(imageUrl.toString())

    }, {
        query: t.Object({
            size: t.Union([
                t.Literal("original"),
                t.Literal("regular"),
                t.Literal("small"),
                t.Literal("thumb_mini"),
            ], { default: "original" }),
            proxy: t.String({ default: proxyApi }),
        })
    })

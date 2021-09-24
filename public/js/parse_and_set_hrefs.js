//https://stackoverflow.com/questions/18931452/node-js-get-path-from-the-request
//https://stackoverflow.com/questions/12525928/how-to-get-request-path-with-express-req-object

function parseUrl(urlObj) {
    const url = new URL(urlObj.origin, urlObj.host)
    $(".page-link").each(function () {
        const page = parseInt($(this).attr("href"))
        if (page) url.searchParams.set("page", page)
        $(this).attr("href", url.toString())
    })
}

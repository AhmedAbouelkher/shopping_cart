const calculatePaginationOffset = (page, limit = 10) => {
    const currentPage = page != null ? parseInt(page) : 1
    const offset = (currentPage - 1) * limit
    return offset
}

module.exports = {
    calculatePaginationOffset
}

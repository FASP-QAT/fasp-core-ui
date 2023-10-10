export const deleteSpecificRowFormTable = function (idx) {
    const rows = [...this.state.rows]
    rows.splice(idx, 1)
    this.setState({ rows })
}
export default deleteSpecificRowFormTable;

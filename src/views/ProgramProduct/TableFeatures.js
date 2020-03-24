export const deleteSpecificRowFormTable = function (idx) {
    //   console.log("hi palash",this.state.rows);
    const rows = [...this.state.rows]
    rows.splice(idx, 1)
    this.setState({ rows })
}
export default deleteSpecificRowFormTable;

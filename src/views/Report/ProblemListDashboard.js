import React from "react";
import { Table } from "reactstrap";
import { PROBLEM_STATUS_IN_COMPLIANCE } from "../../Constants";
import i18n from "../../i18n";
/**
 * Component for Problem List Summary.
 */
export default class ProblemListDashboardComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            problemListUnFilttered: [],
            problemCategoryListFiltered: [],
            problemStatusList: [],
            problemDashboardList: []
        }
    }
    /**
     * Fetches the data based on selected filters on page load
     */
    componentDidMount() {
        var problemListUnFilttered = this.props.problemListUnFilttered.filter(c => c.planningUnitActive != false && c.regionActive != false);
        var problemCategoryList = this.props.problemCategoryList;
        var problemCategoryListFiltered = [];
        var problemStatusList = this.props.problemStatusList.filter(c => c.id != PROBLEM_STATUS_IN_COMPLIANCE);
        var problemStatusListSorted = [];
        problemStatusListSorted.push(problemStatusList[1]);
        problemStatusListSorted.push(problemStatusList[0]);
        problemStatusListSorted.push(problemStatusList[2]);
        problemStatusList = problemStatusListSorted;
        var problemDashboardList = [];
        for (var pc = 0; pc < problemListUnFilttered.length; pc++) {
            if (problemListUnFilttered[pc].problemCategory != undefined) {
                if (problemListUnFilttered[pc].problemCategory.id == 4 || problemListUnFilttered[pc].problemCategory.id == 5 || problemListUnFilttered[pc].problemCategory.id == 6) {
                    var problemCategory = { id: -1, name: 'Other' }
                    problemListUnFilttered.push(problemListUnFilttered[pc].problemCategory = problemCategory);
                }
            }
        }
        for (var pc = 0; pc < problemCategoryList.length; pc++) {
            if (problemCategoryList[pc].id != 4 && problemCategoryList[pc].id != 5 && problemCategoryList[pc].id != 6) {
                problemCategoryListFiltered.push(problemCategoryList[pc]);
            }
        }
        problemCategoryListFiltered.push(
            { id: -1, name: 'Other' }
        )
        for (var ps = 0; ps < problemStatusList.length; ps++) {
            for (var pc = 0; pc < problemCategoryListFiltered.length; pc++) {
                var count = problemListUnFilttered.filter(c => c.problemCategory != undefined && c.problemCategory.id == problemCategoryListFiltered[pc].id && c.problemStatus.id == problemStatusList[ps].id).length;
                var problemDashboardJson = {
                    problemStatus: problemStatusList[ps],
                    problemCategory: problemCategoryListFiltered[pc],
                    count: count
                }
                problemDashboardList.push(problemDashboardJson);
            }
            problemDashboardList.push({
                problemStatus: problemStatusList[ps],
                problemCategory: -1,
                count: problemListUnFilttered.filter(c => c.problemStatus != undefined && c.problemStatus.id == problemStatusList[ps].id).length
            })
        }
        for (var pc = 0; pc < problemCategoryListFiltered.length; pc++) {
            problemDashboardList.push({
                problemStatus: -1,
                problemCategory: problemCategoryListFiltered[pc],
                count: problemListUnFilttered.filter(c => c.problemCategory != undefined && c.problemCategory.id == problemCategoryListFiltered[pc].id && c.problemStatus.id != PROBLEM_STATUS_IN_COMPLIANCE).length
            })
        }
        problemDashboardList.push({
            problemStatus: -1,
            problemCategory: -1,
            count: problemListUnFilttered.filter(c => c.problemStatus != undefined && c.problemStatus.id != PROBLEM_STATUS_IN_COMPLIANCE).length
        })
        this.setState({
            problemCategoryListFiltered: problemCategoryListFiltered,
            problemStatusList: problemStatusList,
            problemDashboardList: problemDashboardList
        })
    }
    /**
     * Renders the Problem list summary table.
     * @returns {JSX.Element} - Problem list summary table.
     */
    render() {
        return (
            <div className="ProblemListDashboardBorder">
                <Table className="table-borderedproblemListDashboar text-center mt-2" responsive size="sm" options={this.options}>
                    <thead>
                        <tr>
                            <td></td>
                            {
                                this.state.problemCategoryListFiltered.map(c => (
                                    <td><b>{c.name}</b></td>
                                ))
                            }
                            <td><b>{i18n.t("static.supplyPlan.total")}</b></td>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            this.state.problemStatusList.map(c => (
                                <tr>
                                    <td><b>{c.name}</b></td>
                                    {this.state.problemCategoryListFiltered.map(pc => {
                                        var count = this.state.problemDashboardList.filter(f => f.problemStatus.id == c.id && f.problemCategory.id == pc.id)[0].count;
                                        return (<td style={{ backgroundColor: count == 0 ? '#d9d9d9' : "" }}>{count}</td>)
                                    })
                                    }
                                    <td style={{ backgroundColor: (this.state.problemDashboardList.filter(f => f.problemStatus.id == c.id && f.problemCategory == -1)[0].count) == 0 ? '#d9d9d9' : "" }}><b>{this.state.problemDashboardList.filter(f => f.problemStatus.id == c.id && f.problemCategory == -1)[0].count}</b></td>
                                </tr>
                            ))
                        }
                        <tr>
                            <td><b>{i18n.t("static.supplyPlan.total")}</b></td>
                            {this.state.problemCategoryListFiltered.map(pc => {
                                var count = this.state.problemDashboardList.filter(f => f.problemCategory.id == pc.id && f.problemStatus == -1)[0].count;
                                return (<td style={{ backgroundColor: count == 0 ? '#d9d9d9' : "" }}><b>{count}</b></td>)
                            })
                            }
                            <td style={{ backgroundColor: (this.state.problemDashboardList.length > 0 ? this.state.problemDashboardList.filter(f => f.problemCategory == -1 && f.problemStatus == -1)[0].count : 0) == 0 ? '#d9d9d9' : "" }}><b>{this.state.problemDashboardList.length > 0 ? this.state.problemDashboardList.filter(f => f.problemCategory == -1 && f.problemStatus == -1)[0].count : 0}</b></td>
                        </tr>
                    </tbody>
                </Table>
            </div>
        )
    }
}
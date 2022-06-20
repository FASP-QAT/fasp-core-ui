import React from "react";
import { PROBLEM_STATUS_IN_COMPLIANCE } from "../../Constants";
import { Table } from "reactstrap";
import i18n from "../../i18n";

export default class ProblemListDashboardComponent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            problemListUnFilttered: [],
            problemCategoryList: [],
            problemStatusList: [],
            problemDashboardList: []
        }
    }

    componentDidMount() {
        var problemListUnFilttered = this.props.problemListUnFilttered.filter(c=> c.planningUnitActive != false && c.regionActive != false);
        var problemCategoryList = this.props.problemCategoryList;
        var problemStatusList = this.props.problemStatusList.filter(c => c.id != PROBLEM_STATUS_IN_COMPLIANCE);
        var problemStatusListSorted = [];
        problemStatusListSorted.push(problemStatusList[1]);
        problemStatusListSorted.push(problemStatusList[0]);
        problemStatusListSorted.push(problemStatusList[2]);
        problemStatusList = problemStatusListSorted;
        var problemDashboardList = [];
        for (var ps = 0; ps < problemStatusList.length; ps++) {
            for (var pc = 0; pc < problemCategoryList.length; pc++) {
                var count = problemListUnFilttered.filter(c => c.problemCategory.id == problemCategoryList[pc].id && c.problemStatus.id == problemStatusList[ps].id).length;
                var problemDashboardJson = {
                    problemStatus: problemStatusList[ps],
                    problemCategory: problemCategoryList[pc],
                    count: count
                }
                problemDashboardList.push(problemDashboardJson);
            }
            problemDashboardList.push({
                problemStatus: problemStatusList[ps],
                problemCategory: -1,
                count: problemListUnFilttered.filter(c => c.problemStatus.id == problemStatusList[ps].id).length
            })
        }
        for (var pc = 0; pc < problemCategoryList.length; pc++) {
            problemDashboardList.push({
                problemStatus: -1,
                problemCategory: problemCategoryList[pc],
                count: problemListUnFilttered.filter(c => c.problemCategory.id == problemCategoryList[pc].id && c.problemStatus.id != PROBLEM_STATUS_IN_COMPLIANCE).length
            })
        }
        problemDashboardList.push({
            problemStatus: -1,
            problemCategory: -1,
            count: problemListUnFilttered.filter(c => c.problemStatus.id != PROBLEM_STATUS_IN_COMPLIANCE).length
        })
        this.setState({
            problemListUnFilttered: problemListUnFilttered,
            problemCategoryList: problemCategoryList,
            problemStatusList: problemStatusList,
            problemDashboardList: problemDashboardList
        })
    }

    render() {
        return (
            <div>
                <Table className="table-bordered text-center mt-2" bordered responsive size="sm" options={this.options} style={{width:"auto"}}>
                    <thead>
                        <tr>
                            <td></td>
                            {
                                this.state.problemCategoryList.map(c => (
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
                                    {this.state.problemCategoryList.map(pc => {
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
                            {this.state.problemCategoryList.map(pc => {
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
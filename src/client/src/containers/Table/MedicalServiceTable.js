import React, {Component} from 'react';

import Typography from '@material-ui/core/Typography';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import LoadingDialog from "../Dialog/OtherDialog/LoadingDialog";
import {allMedicalService} from "../../components/API/AllMedicalService";
import CyclicSortButton from "../Others/CyclicSortButton";
import TableToolbar from "../Others/TableToolbar";
import {capitalFirstChar} from "../../components/Services/CapitalFirstChar";

let columns = [
    {
        id: 'id',
        label: 'ID',
        align: 'center',
        compareFn: (a, b, dir) => {
            const res = a.id - b.id;
            return dir === 'asc' ? res : -res;
        }
    },
    {
        id: 'name',
        label: 'Name',
        compareFn: (a, b, dir) => {
            const res = a.name.toUpperCase() > b.name.toUpperCase() ? 1 : -1;
            return dir === 'asc' ? res : -res;
        }
    },
    {
        id: 'price',
        label: 'Price',
        align: 'right',
        compareFn: (a, b, dir) => {
            const res = +a.price.slice(1) - +b.price.slice(1);
            return dir === 'asc' ? res : -res;
        }
    },
    {
        id: 'department',
        label: 'Department',
        compareFn: (a, b, dir) => {
            const res = a.department.toUpperCase() > b.department.toUpperCase() ? 1 : -1;
            return dir === 'asc' ? res : -res;
        }
    },
];

class MedicalServiceTable extends Component {
    state = {
        medicalServiceList: [],
        sortColumns: [
            // {key: 'id', dir: 'asc'}
        ],
        loading: false,
    };

    async sort() {
        let l = this.state.medicalServiceList;
        console.log(this.state.sortColumns);
        this.state.sortColumns.forEach(c => {
            l.sort((a, b) => columns.find(v => v.id === c.key).compareFn(a, b, c.dir));
        });
        await this.setState({medicalServiceList: l});
    }

    async updateSortColumns(operation, columnID, dir = '') {
        let s = this.state.sortColumns;
        s = s.filter(e => e.key !== columnID);
        if (operation === 'add') {
            s.splice(1, 0, {key: columnID, dir: dir});
        }
        if (!s.length) s.push({key: 'id', dir: 'asc'});
        await this.setState({sortColumns: s});
    }

    sortTools = {
        sort: this.sort.bind(this),
        updateCriteria: this.updateSortColumns.bind(this)
    }

    async updateRowHandle(rows) {
        await this.setState({medicalServiceList: rows});
        await this.sort();
    }

    handleLoading = async (loading) => {
        await this.setState({
            loading: loading
        })
    }

    render() {
        return (
            <React.Fragment>
                <TableToolbar
                    columns={columns}
                    updateRowHandle={this.updateRowHandle.bind(this)}
                    defaultRows={allMedicalService}
                    loadingHandle={this.handleLoading.bind(this)}
                    title = "Medical Services"
                />
                <TableContainer>
                    <Table size="medium" stickyHeader>
                        <TableHead>
                            <TableRow>
                                {columns.map((column) => (
                                    <TableCell key={column.id} align={column.align}>
                                        <CyclicSortButton sortTools={this.sortTools} columnID={column.id}>
                                            {column.label}
                                        </CyclicSortButton>
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {this.state.medicalServiceList.map((row) => {
                                return (
                                    <TableRow hover key={row.id}>
                                        {columns.map((column) => {
                                            return (
                                                <TableCell key={column.id} align={column.align}>
                                                    { (column.id === 'name' || column.id === 'department') ? capitalFirstChar(row[column.id]) : row[column.id]}
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
                <LoadingDialog open={this.state.loading}/>
            </React.Fragment>
        );
    }
}

export default MedicalServiceTable;
import React, { Component } from "react";
import { Table, Button } from "antd";
import { getActiveRequests } from "../../api/requests";
import CancelRequest from "./CancelRequest";
import SendToAgentModal from "../../components/modals/deposit/SendToAgent";

const modals = {
	SEND_REQ_TO_AGENT: "SEND_REQ_TO_AGENT",
};

const style = {
	btn: {
		marginRight: 8,
	},
};

class DepositActiveRequests extends Component {
	state = {
		data: [],
		pagination: {},
		loading: false,
		SEND_REQ_TO_AGENT: false,
		requestId: null,
	};

	componentDidMount() {
		this.fetch();
	}

	hideModal = type => () => {
		this.setState({ [type]: false });
	};

	showModal = (type, requestId) => () => {
		this.setState({ [type]: true, requestId });
	};

	handleTableChange = (pagination, filters, sorter) => {
		const pager = { ...this.state.pagination };
		pager.current = pagination.current;
		this.setState({
			pagination: pager,
		});
		this.fetch({
			results: pagination.pageSize,
			page: pagination.current,
			...filters,
		});
	};

	fetch = async (params = { type: "deposit" }) => {
		// const plug = [
		// 	{
		// 		asset: "oUSD",
		// 		amount: 1000,
		// 		status: "active",
		// 		id: 1,
		// 	},
		// ];
		this.setState({ loading: true });
		try {
			const data = await getActiveRequests(params);
			const pagination = { ...this.state.pagination };
			pagination.total = data.total;
			this.setState({
				loading: false,
				data: data.items,
				pagination,
			});
		} catch (error) {}
	};

	render() {
		const columns = [
			{
				title: "Asset",
				dataIndex: "asset",
			},
			{
				title: "Amount",
				dataIndex: "amount",
			},
			{
				title: "Status",
				dataIndex: "status",
			},
			{
				title: "Created",
				dataIndex: "trx_timestamp",
			},
			{
				title: "Action",
				render: (text, record, index) => {
					return (
						<>
							<Button
								style={style.btn}
								onClick={this.showModal(modals.SEND_REQ_TO_AGENT, record.id)}
							>
								Send to agents
							</Button>
							<CancelRequest btnStyle={style.btn} requestId={record.id} />
						</>
					);
				},
			},
		];

		return (
			<>
				<Table
					columns={columns}
					rowKey={record => record.id}
					dataSource={this.state.data}
					pagination={this.state.pagination}
					loading={this.state.loading}
					onChange={this.handleTableChange}
					className="ovf-auto tbody-white"
				/>
				<SendToAgentModal
					isModalVisible={this.state.SEND_REQ_TO_AGENT}
					hideModal={this.hideModal(modals.SEND_REQ_TO_AGENT)}
					requestId={this.state.requestId}
				/>
			</>
		);
	}
}

export default DepositActiveRequests;

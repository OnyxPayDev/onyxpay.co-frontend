import React, { Component } from "react";
import { Table, Input, Button, Icon } from "antd";
import { connect } from "react-redux";
import UserSettlement from "./userSettlement";
import {
	unblockUser,
	blockedUsersData,
	blockUser,
	isBlockedUser,
	getUsersData,
	updateUserStatus,
} from "../../../redux/admin-panel/users";

const styles = {
	btn: { marginRight: 8 },
};
class Users extends Component {
	state = {
		searchText: "",
		data: [],
		visible: false,
		settlement: [],
		loadingTableData: false,
		user_id: null,
		pagination: { current: 1, pageSize: 20 },
		loadingBlockUser: false,
		loadingUnblockUser: false,
	};

	getColumnSearchProps = dataIndex => ({
		filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
			<div style={{ padding: 8 }}>
				<Input
					ref={node => {
						this.searchInput = node;
					}}
					placeholder={`Search ${dataIndex}`}
					value={selectedKeys[0]}
					onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
					onPressEnter={() => this.handleSearch(selectedKeys, confirm)}
					style={{ width: 188, marginBottom: 8, display: "block" }}
				/>
				<Button
					type="primary"
					onClick={() => this.handleSearch(selectedKeys, confirm)}
					icon="search"
					size="small"
					style={{ width: 90, marginRight: 8 }}
				>
					Search
				</Button>
				<Button onClick={() => this.handleReset(clearFilters)} size="small" style={{ width: 90 }}>
					Reset
				</Button>
			</div>
		),
		filterIcon: filtered => (
			<Icon type="search" style={{ color: filtered ? "#1890ff" : undefined }} />
		),
		onFilterDropdownVisibleChange: visible => {
			if (visible) {
				setTimeout(() => this.searchInput.select());
			}
		},
	});

	handleSearch = (selectedKeys, confirm) => {
		confirm();
		this.setState({ searchText: selectedKeys[0] });
	};

	handleReset = clearFilters => {
		clearFilters();
		this.setState({ searchText: "" });
	};

	showSettlement(dataIndex) {
		this.setState({
			user_id: dataIndex,
			visible: true,
		});
	}

	hideModal = visible => {
		this.setState({
			visible: visible,
		});
	};

	componentDidMount = async () => {
		await this.fetchUsers();
	};

	handleTableChange = (pagination, filters) => {
		this.setState(
			{
				pagination: {
					...this.state.pagination,
					current: pagination.current,
					pageSize: pagination.pageSize,
				},
			},
			() => {
				for (const filter in filters) {
					filters[filter] = filters[filter][0];
				}
				this.fetchUsers(filters);
			}
		);
	};

	async fetchUsers(opts = {}) {
		try {
			this.setState({ loadingTableData: true });
			const { getUsersData } = this.props;
			const { pagination } = this.state;
			const params = {
				pageSize: pagination.pageSize,
				pageNum: pagination.current,
				...opts,
			};
			const res = await getUsersData(params);
			pagination.total = res.adminUsers.total;
			this.setState({ pagination, loadingTableData: false });
		} catch (e) {}
	}

	blockUser = async (wallet_addr, reason, duration, userId) => {
		const { blockUser, isBlockedUser, updateUserStatus } = this.props;
		this.setState({
			user_id: userId,
			loadingBlockUser: true,
		});
		const res = await blockUser(wallet_addr, reason, duration);
		if (!res) {
			this.setState({
				loadingBlockUser: false,
			});
			return false;
		}
		await isBlockedUser(wallet_addr);

		updateUserStatus(userId, 2);

		this.setState({
			loadingBlockUser: false,
		});
	};

	unblockUser = async (wallet_addr, userId) => {
		const { unblockUser, updateUserStatus } = this.props;
		this.setState({
			user_id: userId,
			loadingUnblockUser: true,
		});
		await unblockUser(wallet_addr);

		updateUserStatus(userId, 1);

		this.setState({
			loadingUnblockUser: false,
		});
	};

	render() {
		const { adminUsers } = this.props;
		const { loadingTableData, pagination, loadingBlockUser, loadingUnblockUser } = this.state;
		if (!adminUsers) return null;
		const columns = [
			{
				title: "First name",
				dataIndex: "first_name",
				key: "first_name",
				...this.getColumnSearchProps("first_name"),
				render: res => (res ? res : "n/a"),
			},
			{
				title: "Last name",
				dataIndex: "last_name",
				key: "last_name",
				...this.getColumnSearchProps("last_name"),
				render: res => (res ? res : "n/a"),
			},
			{
				title: "Country",
				dataIndex: "country",
				key: "country",
				...this.getColumnSearchProps("country"),
				render: res => (res ? res : "n/a"),
			},
			{
				title: "Email",
				dataIndex: "email",
				key: "email",
				...this.getColumnSearchProps("email"),
				render: res => (res ? res : "n/a"),
			},
			{
				title: "Phone number",
				dataIndex: "phone_number",
				key: "phone_number",
				...this.getColumnSearchProps("phone_number"),
				render: res => (res ? res : "n/a"),
			},
			{
				title: "Chat id",
				dataIndex: "chat_id",
				key: "chat_id",
				...this.getColumnSearchProps("chat_id"),
				render: res => (res ? res : "n/a"),
			},
			{
				title: "Wallet address",
				dataIndex: "wallet_addr",
				key: "wallet_addr",
				...this.getColumnSearchProps("wallet_addr"),
				render: res => (res ? res : "n/a"),
			},
			{
				title: "Status",
				dataIndex: "status",
				key: "status",
				...this.getColumnSearchProps("status"),
				render: res => (res ? res : "n/a"),
			},
			{
				title: "Actions",
				render: res => (
					<div>
						<Button
							style={styles.btn}
							type="danger"
							icon="user-delete"
							loading={res.user_id === this.state.user_id && loadingBlockUser}
							onClick={() => this.blockUser(res.wallet_addr, 1, 10, res.user_id)}
						>
							Block
						</Button>
						<Button
							style={styles.btn}
							type="primary"
							icon="user-add"
							loading={res.user_id === this.state.user_id && loadingUnblockUser}
							onClick={() => this.unblockUser(res.wallet_addr, res.user_id)}
						>
							Unblock
						</Button>
						{res.is_settlements_exists ? (
							<Button
								style={styles.btn}
								icon="account-book"
								onClick={() => this.showSettlement(res.user_id)}
							>
								Settlement accounts
							</Button>
						) : null}
					</div>
				),
			},
		];

		return (
			<>
				<Table
					columns={columns}
					rowKey={adminUsers => adminUsers.user_id}
					dataSource={adminUsers}
					className="usersTable ovf-auto"
					onChange={this.handleTableChange}
					pagination={{ ...pagination }}
					loading={loadingTableData}
				/>
				{this.state.visible && (
					<UserSettlement
						hideModal={this.hideModal}
						visible={this.state.visible}
						userId={this.state.user_id}
					/>
				)}
			</>
		);
	}
}

const mapStateToProps = state => ({
	adminUsers: state.adminUsers,
});

export default connect(
	mapStateToProps,
	{
		unblockUser,
		blockedUsersData,
		blockUser,
		isBlockedUser,
		getUsersData,
		updateUserStatus,
	}
)(Users);

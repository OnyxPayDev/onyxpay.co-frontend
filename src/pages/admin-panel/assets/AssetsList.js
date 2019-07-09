import React, { Component } from "react";
import { connect } from "react-redux";
import { Card, Button, Table, Icon, message, notification, Input } from "antd";
import Actions from "../../../redux/actions";
import { blockAsset } from "../../../api/admin/assets";
import { isAssetBlocked } from "../../../api/assets";
import AddNewAsset from "../../../components/modals/admin/AddNewAsset";
import { TimeoutError } from "promise-timeout";

const modals = {
	ADD_ASSETS_MODAL: "ADD_ASSETS_MODAL",
};

const style = {
	button: {
		marginRight: 8,
	},
};

function sortValues(valA, valB) {
	if (valA < valB) {
		return -1;
	}
	if (valA > valB) {
		return 1;
	}
	return 0;
}

class AssetsList extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loadingBlockedAsset: false,
			loadingIsBlockedAsset: false,
			loadingAssetsData: true,
			ADD_ASSETS_MODAL: false,
			data: null,
			pagination: { pageSize: 20 },
			symbolKey: null,
		};
	}

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
		onFilter: (value, record) =>
			record[dataIndex]
				.toString()
				.toLowerCase()
				.includes(value.toLowerCase()),
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

	async componentDidMount() {
		const { getAssetsList } = this.props;
		await getAssetsList();
		this.setState({
			loadingAssetsData: false,
		});
	}

	showModal = type => () => {
		this.setState({ ADD_ASSETS_MODAL: true });
	};

	hideModal = type => () => {
		this.setState({ ADD_ASSETS_MODAL: false });
	};

	handleBlockAsset = async (asset_symbol, key) => {
		this.setState({
			symbolKey: key,
			loadingBlockedAsset: true,
		});
		try {
			const res = await blockAsset(asset_symbol);
			if (res.Error === 0) {
				message.success("Asset was successfully blocked");
			}
		} catch (e) {
			if (e instanceof TimeoutError) {
				notification.info({
					message: e.message,
					description:
						"Your transaction has not completed in time. This does not mean it necessary failed. Check result later",
				});
			} else {
				message.error(e.message);
			}
		} finally {
			this.setState({
				loadingBlockedAsset: false,
			});
		}
	};

	handleCheckAssetBlocked = async (asset_symbol, key) => {
		this.setState({
			symbolKey: key,
			loadingIsBlockedAsset: true,
		});
		const res = await isAssetBlocked(asset_symbol);
		this.setState({
			loadingIsBlockedAsset: false,
		});
		if (res) {
			message.success("Asset is blocked");
		} else {
			message.success("Asset isn't blocked");
		}
	};

	render() {
		const {
			loadingIsBlockedAsset,
			pagination,
			loadingBlockedAsset,
			loadingAssetsData,
		} = this.state;
		const { data } = this.props;
		if (!data.length) {
			return false;
		}
		const columns = [
			{
				title: "Asset name",
				key: "symbol",
				width: "80%",
				dataIndex: "symbol",
				sorter: (a, b) => {
					const nameA = a.symbol.toLowerCase();
					const nameB = b.symbol.toLowerCase();
					return sortValues(nameA, nameB);
				},
				sortDirections: ["ascend", "descend"],
				...this.getColumnSearchProps("symbol"),
			},
			{
				title: "Action",
				key: "action",
				width: "20%",
				dataIndex: "",
				render: res => (
					<>
						<Button
							type="danger"
							loading={res.key === this.state.symbolKey && loadingBlockedAsset}
							onClick={() => this.handleBlockAsset(res.symbol, res.key)}
							style={style.button}
						>
							Block asset
						</Button>
						<Button
							loading={res.key === this.state.symbolKey && loadingIsBlockedAsset}
							onClick={() => this.handleCheckAssetBlocked(res.symbol, res.key)}
							style={style.button}
						>
							Is blocked asset
						</Button>
					</>
				),
			},
		];

		return (
			<>
				<Card>
					<div style={{ marginBottom: 30 }}>
						<Button type="primary" onClick={this.showModal(modals.ADD_ASSETS_MODAL)}>
							<Icon type="plus" /> Add new asset
						</Button>
					</div>

					<Table
						rowKey={data => data.key}
						columns={columns}
						dataSource={data}
						style={{ overflowX: "auto" }}
						pagination={pagination}
						loading={loadingAssetsData}
					/>
				</Card>

				<AddNewAsset
					isModalVisible={this.state.ADD_ASSETS_MODAL}
					hideModal={this.hideModal(modals.ADD_ASSETS_MODAL)}
				/>
			</>
		);
	}
}

export default connect(
	state => {
		return {
			data: state.assets.list.map((item, i) => ({ key: i, symbol: item })),
		};
	},
	{
		getAssetsList: Actions.assets.getAssetsList,
	}
)(AssetsList);

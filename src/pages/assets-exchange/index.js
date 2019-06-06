import React, { Component } from "react";
import { connect } from "react-redux";
import { Row, Col, Table, Card, Form, Divider, InputNumber, Button } from "antd";
import { PageTitle } from "../../components";
import Actions from "../../redux/actions";

const columns = [
	{
		title: "Asset name",
		dataIndex: "name",
		key: "name",
		// render: key => <a name={key} onClick={onAssetChosen}>{key}</a>,
	},
	{
		title: "Price",
		dataIndex: "price",
		key: "price",
	},
];

const data = [
	{
		key: "oKES",
		name: "oKES",
		price: 0.08,
	},
	{
		key: "oEUR",
		name: "oEUR",
		price: 42,
	},
	{
		key: "oUAH",
		name: "oUAH",
		price: 32,
	},
];

class AssetsExchange extends Component {
	constructor(props) {
		super(props);
		this.state = {
			selectedAsset: {
				name: "",
				price: 0,
			},
		};
	}

	async componentDidMount() {
		// const { getAssetsList } = this.props;
		// await getAssetsList();
		this.setState({
			selectedAsset: {
				name: data[0].key,
				price: data[0].price,
			},
			buyPrice: 0,
			sellPrice: 0,
		});
	}

	render() {
		// const { assets } = this.props;
		// const { getFieldDecorator } = this.props.form;
		const formItemLayout = {
			labelCol: { span: 8 },
			wrapperCol: { span: 14 },
		};

		const onRow = (record, rowIndex) => {
			return {
				onChange: () => {
					this.setState({
						selectedAsset: {
							name: record.key,
							price: record.price,
						},
					});
				},
			};
		};

		const handleBuyPriceChange = function(value) {
			// this.setState({ buyPrice: value });
			console.log(value);
		};

		const handleSellPriceChange = function(value) {
			// this.setState({ sellPrice: value });
			console.log(value);
		};

		return (
			<>
				<PageTitle>Assets Exchange</PageTitle>

				<Row gutter={16}>
					<Col md={24} lg={12}>
						<Table onRow={onRow} columns={columns} dataSource={data} />
					</Col>
					<Col md={24} lg={12}>
						<Card>
							<Row gutter={16}>
								<Col md={24} lg={12}>
									<Divider> {"Buy " + this.state.selectedAsset.name} </Divider>
									<Form {...formItemLayout} onSubmit={this.handleSubmit}>
										<Form.Item label="Price: ">
											<span className="ant-form-text"> {this.state.selectedAsset.price} </span>
										</Form.Item>

										<Form.Item label="Amount: ">
											<InputNumber min={0} defaultValue={1} onChange={handleBuyPriceChange} />
										</Form.Item>

										<Form.Item label="Total: ">
											<span className="ant-form-text">
												{this.state.selectedAsset.price * this.state.buyPrice}
											</span>
											<span className="ant-form-text">oUSD</span>
										</Form.Item>

										<Form.Item wrapperCol={{ span: 12, offset: 10 }}>
											<Button type="primary" htmlType="submit">
												Buy
											</Button>
										</Form.Item>
									</Form>
								</Col>
								<Col md={24} lg={12}>
									<Divider> {"Sell " + this.state.selectedAsset.name} </Divider>
									<Form {...formItemLayout} onSubmit={this.handleSubmit}>
										<Form.Item label="Price: ">
											<span className="ant-form-text"> {this.state.selectedAsset.price} </span>
										</Form.Item>

										<Form.Item label="Amount: ">
											<InputNumber min={0} defaultValue={1} onChange={handleSellPriceChange} />
										</Form.Item>

										<Form.Item label="Total: ">
											<span className="ant-form-text">
												{" "}
												{this.state.selectedAsset.price * this.state.sellPrice}{" "}
											</span>
											<span className="ant-form-text">oUSD</span>
										</Form.Item>

										<Form.Item wrapperCol={{ span: 12, offset: 10 }}>
											<Button type="primary" htmlType="submit">
												Sell
											</Button>
										</Form.Item>
									</Form>
								</Col>
							</Row>
						</Card>
					</Col>
				</Row>
			</>
		);
	}
}

export default connect(
	state => {
		return {
			// user: state.user,
			assets: state.assets.list,
		};
	}
	// { getAssetsList: Actions.assets.getAssetsList }
)(AssetsExchange);
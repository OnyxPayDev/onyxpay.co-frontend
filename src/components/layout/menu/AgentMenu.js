import React, { Component } from "react";
import { Icon, Menu } from "antd";
import { Link, withRouter } from "react-router-dom";
import { compose } from "redux";
import connect from "react-redux/es/connect/connect";

const SubMenu = Menu.SubMenu;

class AgentMenu extends Component {
	render() {
		const { location } = this.props;
		return (
			<Menu theme="dark" selectedKeys={[location.pathname]} mode="inline">
				<Menu.Item key="/">
					<Link to="/" className="ant-menu-item-content">
						<Icon type="dashboard" />
						<span>Dashboard</span>
					</Link>
				</Menu.Item>
				<SubMenu
					key="OnyxCash (agent)"
					title={
						<span className="ant-menu-item-content">
							<Icon type="interaction" />
							<span>OnyxCash</span>
						</span>
					}
				>
					<Menu.Item key="/deposit:agent">
						<Link to="/deposit:agent">Deposit / buy OnyxCash</Link>
					</Menu.Item>
				</SubMenu>
				<SubMenu
					key="active-requests"
					title={
						<span className="ant-menu-item-content">
							<Icon type="team" />
							<span>Active requests</span>
						</span>
					}
				>
					<Menu.Item key="323">User active requests</Menu.Item>
					<Menu.Item key="3dasd">Agent active requests</Menu.Item>
				</SubMenu>

				<Menu.Item key="/exchange">
					<Link to="/exchange" className="ant-menu-item-content">
						<Icon type="wallet" />
						<span>Assets Exchange</span>
					</Link>
				</Menu.Item>

				<Menu.Item key="/settlement accounts">
					<Link to="/settlement accounts" className="ant-menu-item-content">
						<Icon type="pay-circle" />
						<span>Settlement accounts</span>
					</Link>
				</Menu.Item>

				<Menu.Item key="/messages">
					<Link to="/messages" className="ant-menu-item-content">
						<Icon type="mail" />
						<span>Messages</span>
					</Link>
				</Menu.Item>
			</Menu>
		);
	}
}

function mapStateToProps(state) {
	return {
		user: state.user,
	};
}

AgentMenu = compose(
	withRouter,
	connect(mapStateToProps)
)(AgentMenu);

export default AgentMenu;

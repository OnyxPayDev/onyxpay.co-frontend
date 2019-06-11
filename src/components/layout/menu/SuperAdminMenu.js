import { Icon, Menu } from "antd";
import { Link, withRouter } from "react-router-dom";
import React, { Component } from "react";
import { compose } from "redux";
import connect from "react-redux/es/connect/connect";

const SubMenu = Menu.SubMenu;

class SuperAdminMenu extends Component {
	render() {
		const { location } = this.props;
		return (
			<Menu theme="dark" selectedKeys={[location.pathname]} mode="inline">
				<Menu.Item key="/admin/investments">
					<Link to="/admin/investments" className="ant-menu-item-content">
						<Icon type="pay-circle" />
						<span>Investments</span>
					</Link>
				</Menu.Item>
				<SubMenu
					key="active-requests"
					title={
						<span className="ant-menu-item-content">
							<Icon type="user" />
							<span>Users</span>
						</span>
					}
				>
					<Menu.Item key="/admin/users">
						<Link to="/admin/users">Users</Link>
					</Menu.Item>
					<Menu.Item key="/admin/users/active">
						<Link to="/admin/users/active">Active users</Link>
					</Menu.Item>
					<Menu.Item key="/admin/users/blocked">
						<Link to="/admin/users/blocked">Blocked users</Link>
					</Menu.Item>
				</SubMenu>
				<Menu.Item key="/admin/requests">
					<Link to="/admin/requests" className="ant-menu-item-content">
						<Icon type="pull-request" />
						<span>Request</span>
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

SuperAdminMenu = compose(
	withRouter,
	connect(mapStateToProps)
)(SuperAdminMenu);

export default SuperAdminMenu;

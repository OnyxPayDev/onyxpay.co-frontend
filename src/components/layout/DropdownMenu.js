import React from "react";
import { connect } from "react-redux";
import styled from "styled-components";
import { Avatar, Menu, Dropdown } from "antd";
import Actions from "../../redux/actions";

const UpgradeLink = styled.span`
	color: #1890ff;
`;

const DropdownMenu = ({ logOut }) => {
	const menu = (
		<Menu>
			<Menu.Item>
				<UpgradeLink>Upgrade to Agent</UpgradeLink>
			</Menu.Item>
			<Menu.Item>
				<UpgradeLink>Upgrade to Super Agent</UpgradeLink>
			</Menu.Item>
			<Menu.Divider />
			<Menu.Item onClick={() => logOut()}>
				<span>Logout</span>
			</Menu.Item>
		</Menu>
	);

	return (
		<Dropdown overlay={menu} trigger={["click"]} placement="bottomRight">
			<Avatar
				size="large"
				icon="user"
				style={{ backgroundColor: "#fff", color: "#555", cursor: "pointer" }}
			/>
		</Dropdown>
	);
};

export default connect(
	null,
	{
		logOut: Actions.auth.logOut,
	}
)(DropdownMenu);

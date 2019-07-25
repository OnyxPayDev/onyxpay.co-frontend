import React from "react";
import { Input, Button, Icon } from "antd";

export function handleTableChange({ fetchData, paginationState, setState }) {
	return function(pagination, filters, sorter) {
		setState(
			{
				pagination: {
					...paginationState,
					current: pagination.current,
					pageSize: pagination.pageSize,
				},
			},
			() => {
				for (const filter in filters) {
					filters[filter] = filters[filter][0];
				}
				fetchData({
					...filters,
				});
			}
		);
	};
}

function handleSearch(selectedKeys, confirm, dataIndex, setState) {
	confirm();
	if (dataIndex === "id") {
		setTimeout(() => {
			setState({ idParsedFromURL: selectedKeys[0] });
		}, 0);
	}
}

function handleReset(clearFilters, dataIndex, setState) {
	clearFilters();
	if (dataIndex === "id") {
		setTimeout(() => {
			setState({ idParsedFromURL: "" });
		}, 0);
	}
}

export function getColumnSearchProps(setState, searchInput) {
	return dataIndex => ({
		filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {
			return (
				<div style={{ padding: 8 }}>
					<Input
						ref={node => {
							searchInput = node;
						}}
						placeholder={`Search ${dataIndex}`}
						value={selectedKeys[0]}
						onChange={e => {
							return setSelectedKeys(e.target.value ? [e.target.value] : []);
						}}
						onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex, setState)}
						style={{ width: 188, marginBottom: 8, display: "block" }}
					/>
					<Button
						type="primary"
						onClick={() => handleSearch(selectedKeys, confirm, dataIndex, setState)}
						icon="search"
						size="small"
						style={{ width: 90, marginRight: 8 }}
					>
						Search
					</Button>
					<Button
						onClick={() => handleReset(clearFilters, dataIndex, setState)}
						size="small"
						style={{ width: 90 }}
					>
						Reset
					</Button>
				</div>
			);
		},

		filterIcon: filtered => (
			<Icon type="search" style={{ color: filtered ? "#1890ff" : undefined }} />
		),

		onFilterDropdownVisibleChange: visible => {
			if (visible) {
				setTimeout(() => searchInput.select());
			} else {
				if (searchInput) {
					setTimeout(() => {
						setState({ idParsedFromURL: searchInput.props.value });
					}, 0);
				}
			}
		},
	});
}
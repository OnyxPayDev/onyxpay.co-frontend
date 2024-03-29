import React, { Component } from "react";
import { connect } from "react-redux";
import { Formik } from "formik";
import { Modal, Typography, Select, Form, Input, Upload, Button, Icon, message } from "antd";
import { get } from "lodash";
import Tabs, { Tab, TabContent, TabsContainer, TabLabel, TabsNav } from "./tabs";
import { SelectContainer, ImportTitle, FormButtons } from "./styled";
import { importMnemonics, importPrivateKey, getWallet, decryptWallet } from "../../../api/wallet";
import { isMnemonicsValid, isPkValid, samePassword } from "../../../utils/validate";
import Actions from "../../../redux/actions";

/* 
	TODO:
	* debounce validation
	* refactor repetition
*/

const { Title } = Typography;
const Option = Select.Option;
const { TextArea } = Input;

function isLtSize(file, mbSize) {
	return file.size / 1024 / 1024 < mbSize;
}

class ImportWalletModal extends Component {
	state = this.initState();

	initState() {
		return {
			activeTabIndex: 0,
			fileList: [],
			fileReadError: "",
			uploadedWallet: null,
		};
	}

	handleTabChange = activeTabIndex => {
		const initialState = this.initState();
		this.setState({ ...initialState, activeTabIndex: Number(activeTabIndex) });
	};

	handleUnlockWithMnemonics = async ({ mnemonics, password }, formActions) => {
		const { hideModal } = this.props;
		try {
			const { wallet } = await importMnemonics(mnemonics, password);
			this.props.setWallet(wallet);
			formActions.resetForm();
			this.setState({ ...this.initState() });
			hideModal();
			message.success("You successfully imported your wallet", 5);
		} catch (error) {
			console.log(error);
		} finally {
			formActions.setSubmitting(false);
		}
	};

	handleUnlockWithPk = async ({ pk, password }, formActions) => {
		const { hideModal } = this.props;
		try {
			const { wallet } = await importPrivateKey(pk, password);
			this.props.setWallet(wallet);
			formActions.resetForm();
			this.setState({ ...this.initState() });
			hideModal();
			message.success("You successfully imported your wallet", 5);
		} catch (error) {
			console.log(error);
		} finally {
			formActions.setSubmitting(false);
		}
	};

	handleUnlockWithFile = async ({ wallet_account_address, password }, formActions) => {
		const { uploadedWallet } = this.state;
		const { hideModal } = this.props;
		const accounts = uploadedWallet.accounts.filter(acc => acc.address === wallet_account_address);
		uploadedWallet.accounts = accounts;
		uploadedWallet.defaultAccountAddress = wallet_account_address;

		try {
			const { wallet } = await decryptWallet(uploadedWallet, password);
			console.log("handleUnlockWithFile", wallet);
			this.props.setWallet(wallet);
			formActions.resetForm();
			this.setState({ ...this.initState() });
			hideModal();
			message.success("You successfully imported your wallet", 5);
		} catch (error) {
			if (error === 53000) {
				formActions.setFieldError("password", "account's password is not correct");
			}
		} finally {
			formActions.setSubmitting(false);
		}
	};

	handleFileChange = ({ file, fileList }) => {
		const isLt1M = isLtSize(file, 1);
		fileList = fileList.slice(-1);

		if (isLt1M) {
			this.setState({ fileList, fileReadError: "" });
		} else {
			this.setState({ fileList: [], fileReadError: "wallet file is not valid" });
		}
	};

	handleFileUpload = setFieldValue => (file, fileList) => {
		const isLt1M = isLtSize(file, 1);

		if (isLt1M) {
			const reader = new FileReader();
			reader.onloadend = async e => {
				let data = get(e.target, "result");
				try {
					const wallet = getWallet(JSON.parse(data)).toJsonObj();
					this.setState({ uploadedWallet: wallet }, () => {
						if (this.state.uploadedWallet.accounts.length === 1) {
							setFieldValue(
								"wallet_account_address",
								this.state.uploadedWallet.accounts[0].address
							);
						} else {
							setFieldValue("wallet_account_address", "");
						}
					});
				} catch (e) {
					this.setState({ fileReadError: "wallet file is not valid" });
				}
			};
			reader.readAsText(file);
		} else {
			this.setState({ fileReadError: "wallet file is not valid" });
		}

		return false;
	};

	handleFileRemoval = setFieldValue => file => {
		const { fileList } = this.state;
		if (file.name === fileList[0].name) {
			this.setState({ uploadedWallet: null });
			setFieldValue("wallet_account_address", "");
		}
	};

	handleAccountChange = setFieldValue => (value, option) => {
		setFieldValue("wallet_account_address", value);
	};

	render() {
		const { isModalVisible, hideModal, switchModal } = this.props;
		const { activeTabIndex, fileList, fileReadError, uploadedWallet } = this.state;
		return (
			<Modal
				title=""
				visible={isModalVisible}
				onCancel={hideModal}
				footer={null}
				className="import-wallet-modal"
			>
				<div>
					<Title level={3} style={{ textAlign: "center" }}>
						Import Your Wallet
					</Title>

					<ImportTitle>Select how you would like to import</ImportTitle>

					<SelectContainer>
						<Select defaultValue="0" style={{ width: "100%" }} onChange={this.handleTabChange}>
							<Option value="0">Import wallet</Option>
							<Option value="1">Mnemonics phrase</Option>
							<Option value="2">Private key</Option>
						</Select>
					</SelectContainer>

					<TabsContainer>
						<TabsNav>
							<Tabs value={activeTabIndex} onChange={this.handleTabChange}>
								<Tab>
									<TabLabel>Import wallet file</TabLabel>
								</Tab>
								<Tab>
									<TabLabel>Mnemonics phrase</TabLabel>
								</Tab>
								<Tab>
									<TabLabel>Private key</TabLabel>
								</Tab>
							</Tabs>
						</TabsNav>

						{/* Import wallet tab */}
						{activeTabIndex === 0 && (
							<TabContent>
								<div>
									<Formik
										onSubmit={this.handleUnlockWithFile}
										initialValues={{ wallet_account_address: "", password: "" }}
										validate={({ password, wallet_account_address }) => {
											let errors = {};

											if (!password) {
												errors.password = "required";
											}
											if (!wallet_account_address) {
												errors.wallet_account_address = "required";
											}
											return errors;
										}}
									>
										{({
											values,
											errors,
											touched,
											isSubmitting,
											handleChange,
											handleBlur,
											handleSubmit,
											setFieldValue,
											...rest
										}) => {
											return (
												<form onSubmit={handleSubmit}>
													<Form.Item
														label="Select your wallet file"
														validateStatus="error"
														help={fileReadError && fileReadError}
														className="ant-form-item--lh32"
													>
														<Upload
															className="upload-wallet-container"
															fileList={fileList}
															multiple={false}
															onChange={this.handleFileChange}
															beforeUpload={this.handleFileUpload(setFieldValue)}
															onRemove={this.handleFileRemoval(setFieldValue)}
														>
															<Button block>
																<Icon type="upload" /> Click here to upload file
															</Button>
														</Upload>
													</Form.Item>

													<Form.Item
														label="Choose account"
														className="ant-form-item--lh32"
														validateStatus={
															errors.wallet_account_address && touched.wallet_account_address
																? "error"
																: ""
														}
														help={
															errors.wallet_account_address && touched.wallet_account_address
																? errors.wallet_account_address
																: ""
														}
													>
														<Select
															showSearch
															name="wallet_account_address"
															optionFilterProp="children"
															value={
																uploadedWallet && uploadedWallet.accounts.length === 1
																	? uploadedWallet.accounts[0].address
																	: values.wallet_account_address
															}
															onChange={this.handleAccountChange(setFieldValue)}
															filterOption={(input, option) =>
																option.props.children.toLowerCase().indexOf(input.toLowerCase()) >=
																0
															}
															disabled={!uploadedWallet || isSubmitting}
														>
															{uploadedWallet ? (
																uploadedWallet.accounts.map(acc => {
																	return (
																		<Option key={acc.address} value={acc.address}>
																			{acc.address}
																		</Option>
																	);
																})
															) : (
																<Option key="fdf">none</Option>
															)}
														</Select>
													</Form.Item>

													<Form.Item
														label="Account's password"
														className="ant-form-item--lh32"
														validateStatus={errors.password && touched.password ? "error" : ""}
														help={errors.password && touched.password ? errors.password : ""}
													>
														<Input.Password
															name="password"
															type="password"
															value={values.password}
															onChange={handleChange}
															onBlur={handleBlur}
															disabled={isSubmitting}
														/>
													</Form.Item>

													<FormButtons isSubmitting={isSubmitting} switchModal={switchModal} />
												</form>
											);
										}}
									</Formik>
								</div>
							</TabContent>
						)}
						{/* Mnemonics tab */}
						{activeTabIndex === 1 && (
							<TabContent>
								<div>
									<Formik
										onSubmit={this.handleUnlockWithMnemonics}
										initialValues={{ mnemonics: "", password: "", password_confirm: "" }}
										validate={({ mnemonics, password, password_confirm }) => {
											let errors = {};
											if (!mnemonics) {
												errors.mnemonics = "required";
											} else if (!isMnemonicsValid(mnemonics)) {
												errors.mnemonics = "mnemonics phrase is not valid";
											}
											if (!password) {
												errors.password = "required";
											} else if (!password_confirm) {
												errors.password_confirm = "required";
											} else {
												errors = samePassword({ password, password_confirm });
											}
											return errors;
										}}
									>
										{({
											values,
											errors,
											touched,
											isSubmitting,
											handleChange,
											handleBlur,
											handleSubmit,
											...rest
										}) => {
											return (
												<form onSubmit={handleSubmit}>
													<Form.Item
														label="Please enter your 24 word phrase"
														validateStatus={errors.mnemonics && touched.mnemonics ? "error" : ""}
														help={errors.mnemonics && touched.mnemonics ? errors.mnemonics : ""}
													>
														<TextArea
															name="mnemonics"
															value={values.mnemonics}
															onChange={handleChange}
															onBlur={handleBlur}
															disabled={isSubmitting}
															rows={3}
															style={{ resize: "none" }}
														/>
													</Form.Item>

													<Form.Item
														label="Password"
														className="ant-form-item--lh32"
														validateStatus={errors.password && touched.password ? "error" : ""}
														help={errors.password && touched.password ? errors.password : ""}
													>
														<Input.Password
															name="password"
															type="password"
															value={values.password}
															onChange={handleChange}
															onBlur={handleBlur}
															disabled={isSubmitting}
														/>
													</Form.Item>

													<Form.Item
														label="Confirm password"
														className="ant-form-item--lh32"
														validateStatus={
															errors.password_confirm && touched.password_confirm ? "error" : ""
														}
														help={
															errors.password_confirm && touched.password_confirm
																? errors.password_confirm
																: ""
														}
													>
														<Input.Password
															name="password_confirm"
															type="password"
															value={values.password_confirm}
															onChange={handleChange}
															onBlur={handleBlur}
															disabled={isSubmitting}
														/>
													</Form.Item>

													<FormButtons isSubmitting={isSubmitting} switchModal={switchModal} />
												</form>
											);
										}}
									</Formik>
								</div>
							</TabContent>
						)}
						{/* Private key tab */}
						{activeTabIndex === 2 && (
							<TabContent>
								<div>
									<Formik
										onSubmit={this.handleUnlockWithPk}
										initialValues={{ pk: "", password: "", password_confirm: "" }}
										validate={({ pk, password, password_confirm }) => {
											let errors = {};
											if (!pk) {
												errors.pk = "required";
											} else if (!isPkValid(pk)) {
												errors.pk = "Private key is not valid";
											}
											if (!password) {
												errors.password = "required";
											} else if (!password_confirm) {
												errors.password_confirm = "required";
											} else {
												errors = samePassword({ password, password_confirm });
											}
											return errors;
										}}
									>
										{({
											values,
											errors,
											touched,
											isSubmitting,
											handleChange,
											handleBlur,
											handleSubmit,
											...rest
										}) => {
											return (
												<form onSubmit={handleSubmit}>
													<Form.Item
														label="Please enter your private key"
														validateStatus={errors.pk && touched.pk ? "error" : ""}
														help={errors.pk && touched.pk ? errors.pk : ""}
													>
														<TextArea
															name="pk"
															value={values.pk}
															onChange={handleChange}
															onBlur={handleBlur}
															disabled={isSubmitting}
															rows={2}
															style={{ resize: "none" }}
														/>
													</Form.Item>

													<Form.Item
														label="Password"
														className="ant-form-item--lh32"
														validateStatus={errors.password && touched.password ? "error" : ""}
														help={errors.password && touched.password ? errors.password : ""}
													>
														<Input.Password
															name="password"
															type="password"
															value={values.password}
															onChange={handleChange}
															onBlur={handleBlur}
															disabled={isSubmitting}
														/>
													</Form.Item>

													<Form.Item
														label="Confirm password"
														className="ant-form-item--lh32"
														validateStatus={
															errors.password_confirm && touched.password_confirm ? "error" : ""
														}
														help={
															errors.password_confirm && touched.password_confirm
																? errors.password_confirm
																: ""
														}
													>
														<Input.Password
															name="password_confirm"
															type="password"
															value={values.password_confirm}
															onChange={handleChange}
															onBlur={handleBlur}
															disabled={isSubmitting}
														/>
													</Form.Item>

													<FormButtons isSubmitting={isSubmitting} switchModal={switchModal} />
												</form>
											);
										}}
									</Formik>
								</div>
							</TabContent>
						)}
					</TabsContainer>
				</div>
			</Modal>
		);
	}
}

export default connect(
	null,
	{ setWallet: Actions.wallet.setWallet }
)(ImportWalletModal);

import React, { Component } from "react";
import { connect } from "react-redux";
import { push } from "connected-react-router";
import { Formik } from "formik";
import { Modal, Button, Form, Input, Select, message } from "antd";
import { country_list } from "../../assets/country_list";
import Actions from "../../redux/actions";
import { unlockWalletAccount } from "../../api/wallet";
import { ErrorText } from "../styled";
import text from "../../assets/text.json";
import { signWithPk } from "../../utils/blockchain";

const { Option } = Select;

const initialValues = {
	first_name: "",
	last_name: "",
	country_id: "",
	referral_code: "",
};

function areBcErrors(data) {
	const keysToCheck = ["public_key", "wallet_addr"];
	return keysToCheck.some(key => data.hasOwnProperty(key));
}

class RegistrationModal extends Component {
	state = this.getInitialState();

	getInitialState() {
		return {
			isBcValidationError: false,
		};
	}

	handleFormSubmit = async (values, formActions) => {
		const { signUp, push, getUserData } = this.props;
		// getUserData();
		try {
			const { pk, publicKey, accountAddress } = await unlockWalletAccount();
			const algorithm = pk.algorithm;
			const curve = pk.parameters.curve;
			const { value: signedMsg } = signWithPk("MAGIC", pk);

			values.public_key = publicKey;
			values.wallet_addr = accountAddress;
			values.signed_msg = signedMsg;

			console.log({ algorithm, curve, publicKey, accountAddress });

			const { error } = await signUp(values);

			console.log("handleFormSubmit", error);
			if (error) {
				if (error.data) {
					formActions.setErrors(error.data);
					if (areBcErrors(error.data)) {
						this.setState({ isBcValidationError: true });
					}
				}
			} else {
				await getUserData();
				message.success(text.modals.registration.reg_success, 5);
				formActions.resetForm();
				push("/");
			}
			formActions.setSubmitting(false);
		} catch (error) {
			console.log(error);
			formActions.setSubmitting(false);
		}
	};

	handleSelectChange = setFieldValue => (value, option) => {
		setFieldValue("country_id", value);
	};

	handleHideModal = () => {
		const { hideModal } = this.props;
		hideModal();
		this.setState(this.getInitialState());
	};

	render() {
		const { isModalVisible } = this.props;
		const { isBcValidationError } = this.state;

		return (
			<Modal
				title="Create Client account"
				visible={isModalVisible}
				onCancel={this.handleHideModal}
				footer={null}
				className="registration-modal"
				destroyOnClose={true}
			>
				<Formik
					onSubmit={this.handleFormSubmit}
					initialValues={initialValues}
					validate={values => {
						let errors = {};
						if (!values.first_name) {
							errors.first_name = "required";
						}
						if (!values.last_name) {
							errors.last_name = "required";
						}
						if (!values.country_id) {
							errors.country_id = "required";
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
									label="First name"
									required
									validateStatus={errors.first_name && touched.first_name ? "error" : ""}
									help={errors.first_name && touched.first_name ? errors.first_name : ""}
								>
									<Input
										name="first_name"
										placeholder="Enter your first name"
										value={values.first_name}
										onChange={handleChange}
										onBlur={handleBlur}
										disabled={isSubmitting}
									/>
								</Form.Item>

								<Form.Item
									label="Last name"
									required
									validateStatus={errors.last_name && touched.last_name ? "error" : ""}
									help={errors.last_name && touched.last_name ? errors.last_name : ""}
								>
									<Input
										name="last_name"
										placeholder="Enter your last name"
										value={values.last_name}
										onChange={handleChange}
										onBlur={handleBlur}
										disabled={isSubmitting}
									/>
								</Form.Item>

								<Form.Item
									label="Country"
									required
									validateStatus={errors.country_id && touched.country_id ? "error" : ""}
									help={errors.country_id && touched.country_id ? errors.country_id : ""}
								>
									<Select
										showSearch
										name="country_id"
										placeholder="Select a country"
										optionFilterProp="children"
										value={values.country_id}
										onChange={this.handleSelectChange(setFieldValue)}
										filterOption={(input, option) =>
											option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
										}
										disabled={isSubmitting}
									>
										{country_list.map(country => {
											return (
												<Option key={country} value={country}>
													{country}
												</Option>
											);
										})}
									</Select>
								</Form.Item>

								<Form.Item label="Referral code">
									<Input
										name="referralCode"
										value={values.referralCode}
										onChange={handleChange}
										onBlur={handleBlur}
										disabled={isSubmitting}
									/>
								</Form.Item>

								{isBcValidationError && <ErrorText>{text.modals.registration.bc_error}</ErrorText>}

								<div className="ant-modal-custom-footer">
									<Button key="back" onClick={this.handleHideModal} style={{ marginRight: 10 }}>
										Cancel
									</Button>
									<Button
										type="primary"
										htmlType="submit"
										disabled={isSubmitting}
										loading={isSubmitting}
									>
										Submit
									</Button>
								</div>
							</form>
						);
					}}
				</Formik>
			</Modal>
		);
	}
}

export default connect(
	null,
	{
		unlockWallet: Actions.walletUnlock.showWalletUnlockModal,
		getUserData: Actions.user.getUserData,
		signUp: Actions.auth.signUp,
		push,
	}
)(RegistrationModal);

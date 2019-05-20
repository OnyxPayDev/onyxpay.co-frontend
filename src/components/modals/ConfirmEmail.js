import React, { Component } from "react";
import { connect } from "react-redux";
import { Formik } from "formik";
import { Modal, Button, Form, Input } from "antd";
import { isEmailValid } from "../../utils/validate";
import Actions from "../../redux/actions";

class ConfirmEmailModal extends Component {
	state = {
		viewIndex: 0,
	};

	handleFormSubmit = async (values, formActions) => {
		const { confirmEmail } = this.props;
		const { error, data } = await confirmEmail(values.email);
		if (error && data) {
			formActions.setErrors(data);
		} else if (!error) {
			this.changeView(1)();
		}
		formActions.setSubmitting(false);
	};

	changeView = index => () => {
		this.setState({ viewIndex: index });
	};

	render() {
		const { isModalVisible, hideModal } = this.props;
		const { viewIndex } = this.state;

		return (
			<Modal
				title=""
				visible={isModalVisible}
				footer={null}
				closable={false}
				destroyOnClose={true}
				className="confirm-email-modal"
			>
				{viewIndex === 0 && (
					<div>
						<h1>You are almost there!</h1>
						<p>
							Your account has successfully been created, to finish the registration process you
							need to confirm your email
						</p>
						<Formik
							onSubmit={this.handleFormSubmit}
							initialValues={{ email: "" }}
							validate={values => {
								let errors = {};
								if (!values.email) {
									errors.email = "required";
								} else if (!isEmailValid(values.email)) {
									errors.email = "Enter valid email";
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
											validateStatus={errors.email && touched.email ? "error" : ""}
											help={errors.email && touched.email ? errors.email : ""}
										>
											<Input
												placeholder="Please, enter your email address"
												name="email"
												type="email"
												value={values.email}
												onChange={handleChange}
												onBlur={handleBlur}
												disabled={isSubmitting}
											/>
										</Form.Item>

										<div className="ant-modal-custom-footer">
											<Button key="back" onClick={hideModal} style={{ marginRight: 10 }}>
												Logout
											</Button>
											<Button
												type="primary"
												htmlType="submit"
												disabled={isSubmitting}
												loading={isSubmitting}
											>
												Confirm Email
											</Button>
										</div>
									</form>
								);
							}}
						</Formik>
					</div>
				)}

				{viewIndex === 1 && (
					<div>
						<h1>You are almost there!</h1>
						<p>
							Now, please, check your email and follow the instructions, after that, click on this
							<Button type="link" style={{ padding: "0 2px", height: "auto" }}>
								confirm
							</Button>
							link...
						</p>
						<div className="ant-modal-custom-footer">
							<Button key="back" onClick={hideModal} style={{ marginRight: 10 }}>
								Logout
							</Button>
							<Button onClick={this.changeView(0)}>Go back</Button>
						</div>
					</div>
				)}
			</Modal>
		);
	}
}

export default connect(
	null,
	{ confirmEmail: Actions.auth.confirmEmail }
)(ConfirmEmailModal);

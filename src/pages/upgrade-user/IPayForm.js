import React, { Component } from "react";
import { Input } from "antd";
import iPayPic from "../../assets/icons/iPay.png";
import { getPaymentForm } from "../../api/upgrade";

export class IPayForm extends Component {
	state = {
		form: {},
	};
	formRef = React.createRef();
	handleSubmit(event) {
		event.preventDefault();
		getPaymentForm(this.props.amount).then(data => {
			this.setState({ form: data.data }, () => {
				this.formRef.current.submit();
				this.props.handleSubmit();
			});
		});
	}

	render() {
		this.handleSubmit = this.handleSubmit.bind(this);
		return (
			<div>
				<form
					action="https://payments.ipayafrica.com/v3/ke"
					method="post"
					target="_blank"
					onSubmit={this.handleSubmit}
					ref={this.formRef}
					className="ipay-form"
				>
					{Object.keys(this.state.form).map(keyName => {
						console.log(this.state.form);
						return (
							<Input key={keyName} type="hidden" name={keyName} value={this.state.form[keyName]} />
						);
					})}
					<Input type="image" src={iPayPic} alt="Buy Now with iPay" className="ipay-form__input" />
				</form>
			</div>
		);
	}
}

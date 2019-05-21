import React, { Component } from "react";
import { Route, Switch } from "react-router-dom";
import Layout from "./components/layout";
import Authorization from "./providers/Authorization";
import Loadable from "react-loadable";
import { Loader } from "./components";

// import { getContractsAddress } from "./api/contracts";
// import { initBalanceProvider } from "./providers/balanceProvider";
import UnlockWalletModal from "./components/modals/wallet/UnlockWalletModal";

const Deposit2 = props => <div>Agent's deposit...</div>;

let Dashboard = Loadable({
	loader: () => import(/* webpackChunkName: "Home" */ "./pages/dashboard"),
	loading: Loader,
});

let AdminPanel = Loadable({
	loader: () => import(/* webpackChunkName: "Admin" */ "./pages/admin-panel/investments"),
	loading: Loader,
});

const Login = Loadable({
	loader: () => import(/* webpackChunkName: "Login" */ "./pages/login"),
	loading: Loader,
});

let Page404 = Loadable({
	loader: () => import(/* webpackChunkName: "Page404" */ "./pages/404"),
	loading: Loader,
});

const Deposit = Loadable({
	loader: () => import(/* webpackChunkName: "Page404" */ "./pages/deposit"),
	loading: Loader,
});

// permissions
const User = Authorization(["user"]);
const Agent = Authorization(["agent", "super agent"]);
const All = Authorization(["user", "agent", "super agent"]);
const Admin = Authorization(["admin", "super admin"]);

// routes with permissions
Dashboard = All(Dashboard);
const UserDeposit = User(Deposit);
const AgentDeposit = Agent(Deposit2);
const SuperAdmin = Admin(AdminPanel);
Page404 = All(Page404);

class App extends Component {
	state = {
		collapsed: false,
	};

	componentDidMount() {
		// getContractsAddress();
		// initBalanceProvider();
	}

	toggleSidebar = () => {
		this.setState({
			collapsed: !this.state.collapsed,
		});
	};

	render() {
		const { collapsed } = this.state;

		return (
			<Layout
				isSideBarCollapsed={collapsed}
				toggleSidebar={this.toggleSidebar}
				simplified={["/login"]}
			>
				<Switch>
					<Route path="/" exact component={Dashboard} />
					<Route path="/admin/investments" exact component={SuperAdmin} />
					<Route path="/login" exact component={Login} />
					<Route path="/deposit" component={UserDeposit} />
					<Route path="/deposit:agent" exact component={AgentDeposit} />
					<Route component={Page404} />
				</Switch>
				<UnlockWalletModal />
			</Layout>
		);
	}
}

export default App;

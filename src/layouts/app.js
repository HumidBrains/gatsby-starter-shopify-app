import React from "react"
import PropTypes from "prop-types"
import { StaticQuery, graphql, Link } from "gatsby"
import GraphqlProvider from "../providers/graphql"
import { AppProvider, Card } from "@shopify/polaris"

import "@shopify/polaris/styles.css"

import { 
    getShopToken,
    getShopDomain,
    isAuthenticated, 
    setHmacQueryCookie,
    refreshAuth
} from "../helpers/auth"
//import Header from "../components/header"

const CustomLinkComponent = ({ children, url, external, ...rest }) => {
    if (external) {
        return (
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                {...rest}
            >
                {children}
            </a>
        )
    }

    return (
        <Link
            to={url}
            {...rest}
        >
            {children}
        </Link>
    )
}
class AppLayout extends React.Component {
    state = {
        shop: null,
        token: null,
        isLoading: true,
    }

    componentDidMount = async () => {
        if (typeof window !== 'undefined') {
            let isAuth = false
            const queryParams = window.location.search

            if (queryParams && queryParams.includes('shop')) {
                setHmacQueryCookie(queryParams)
            }

            isAuth = await isAuthenticated()

            const shop = getShopDomain()
            const token = getShopToken(shop)

            if (isAuth) {
                this.setState({
                    shop,
                    token,
                    isLoading: false,
                })
            }
        }
    }

    render() {
        const { shop, token, isLoading } = this.state
        //let appTitle = '' // convert to new Gatsy useStaticQuery hook
        let content = ''

        if (isLoading) {
            content = (
                <Card>
                    <Card.Section>
                        <p>Initializing app...</p>
                    </Card.Section>
                </Card>
            )
        } else if (!shop || shop === null) {
            content = (
                <Card>
                    <Card.Section>
                        <p>Error initializing app...</p>
                        <Link to="/install">Re-Install App</Link>
                    </Card.Section>
                </Card>
            
            )
        } else {
            content = (
                <GraphqlProvider
                    shop={shop}
                    token={token}
                >
                    {this.props.children}
                </GraphqlProvider>
            )
        }

        return (
            <AppProvider
                shopOrigin={shop || ''}
                apiKey={process.env.GATSBY_SHOPIFY_APP_API_KEY}
                linkComponent={CustomLinkComponent}
                forceRedirect={(process.env.NODE_ENV === 'development') ? false : true}
            >
                {content}
            </AppProvider> 
        )
    }
}

AppLayout.propTypes = {
    children: PropTypes.node.isRequired,
}

export default AppLayout

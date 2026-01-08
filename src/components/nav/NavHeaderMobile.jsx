import "./NavHeaderMobile.scss"
import React from 'react'
import {Card} from "react-bootstrap"
import NavProfileCard from "/src/components/nav/partials/NavProfileCard.jsx"
import NavToolThemePicker from "/src/components/nav/tools/NavToolThemePicker.jsx"
import NavLinkPills from "/src/components/nav/partials/NavLinkPills.jsx"

function NavHeaderMobile({ profile, links }) {
    return (
        <nav className={`nav-header-mobile`}>
            <Card className={`nav-header-mobile-card-wrapper`}>
                <NavProfileCard profile={profile}
                                expanded={true}/>

                <div className={`right-tool-container`}>
                    <NavToolThemePicker/>
                </div>

                <NavLinkPills id={`nav-link-pills-menu`}
                              links={links}/>
            </Card>
        </nav>
    )
}

export default NavHeaderMobile
import aspect from "dojo/aspect";
import declare from "dojo/_base/declare";
import when from "dojo/when";
import topic from "dojo/topic";
import _WidgetBase from "dijit/_WidgetBase";

import ContentReference from "epi-cms/core/ContentReference";
import formatters from "epi-cms/dgrid/formatters";
import epiUsername from "epi/username";
import epiDate from "epi/datetime";
import _ContentContextMixin from "epi-cms/_ContentContextMixin";
import dependency from "epi/dependency";

import React from "react";
import ReactDom from "react/react-dom";

let Version = React.createClass({
    onClick () {
        this.props.selectVersion(this.props.version);
    },
    render () {
        let className = 'version';
        if(this.props.isSelected) {
            className += ' selected';
        }
        var version = this.props.version;
        return (
            <li className={className} onClick={this.onClick}>
                <span className="status">{formatters.versionStatus(version.status)}</span>
                <span className="saved-date epi-secondaryText">{epiDate.toUserFriendlyString(version.savedDate)}</span>
                <span className="username epi-secondaryText">Changed by {epiUsername.toUserFriendlyString(version.savedBy)}</span>
            </li>
            )
    }
});

let VersionList = React.createClass({
    getInitialState () {
        return {
            versions: [],
            selectedVersion: null
        };
    },
    componentWillMount () {

        // Hook up the epi dependencies when the component is mounted
        let registry = dependency.resolve("epi.storeregistry");
        this._store = registry.get("epi.cms.contentversion");
        this._contextMixin = new _ContentContextMixin();

        // Listen to context changes in the system and get new data when it has changed
        this.handle = aspect.after(this._contextMixin, "contextChanged", () => {
            this.updateData();
        });
    },
    componentWillUnmount () {
        
        // remove the aspect handle
        this.handle.remove();
        this.handle = null;

        // Destroy the epi depdenencies
        this._contextMixin.destroy();
        this._contextMixin = null;
    },
    updateData () {

        // Get the content data for the current context
        when(this._contextMixin.getCurrentContent()).then((content)=> {
            let query = {
                contentLink: new ContentReference(content.contentLink).createVersionUnspecificReference().toString()
            };
            // Ask the store for new data based on the current context
            when(this._store.query(query)).then((versions)=> {
                // Set the versions
                this.setState({versions: versions});
            });
        });
    },
    componentDidMount () {
        this.updateData();
    },

    selectVersion (version) {
        this.setState({
            selectedVersion: version
        });

        // When someone clicks on the version in the list we should navigate to that item
        // and we do that by publishing a context request change
        topic.publish("/epi/shell/context/request", { uri: "epi.cms.contentdata:///" + version.contentLink }, {forceReload: true, sender: this});
    },
    
    render () {
        let selectedVersion = this.state.selectedVersion;
        return (
            <ul className="react-versionlist">
                {
                    this.state.versions.map(function(version) {
                        var isSelected = selectedVersion && version.contentLink == selectedVersion.contentLink;
                        return <Version version={version} isSelected={isSelected} selectVersion={this.selectVersion} key={version.contentLink}/>
                    }.bind(this))
                }
            </ul>
            );
    }
});

// The Dijit framework requires that the Dijit module returns a widget
// and React wants a domNode, so the easiest way to combine them is to create a 
// _WidgetBase (smallest possible widget) and then hook up the buildRendering callback (when dijit has created the domNode)
// and tell React to render the component on the domNode
export default declare([_WidgetBase], {
    baseClass: 'react-versiongadget',
    
    buildRendering: function() {
        this.inherited(arguments);

        // Create the react component when dijit has created the domNode
        this.reactComponent = ReactDom.render(React.createFactory(VersionList)({}), this.domNode);
    },
    destroy: function () {
        this.inherited(arguments);

        // Destroy the react component when the widget is destroyed
        if (this.reactComponent) {
            this.reactComponent.componentWillUnmount();
        }
    }
});
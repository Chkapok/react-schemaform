﻿import * as React from "react";

import ComponentRegistery from "./ComponentRegistery"

import UpSchemaFormComponentSelector from "./UpSchemaFormComponentSelector"
import JsonSchemaHelper from "../JsonSchemaHelper"
import UpSchemaObject from "./UpSchemaObject"
import ErrorMemory from "./ErrorMemory"


interface UpSchemaArrayProps {
    schema: JsonSchema;
    onChange: (arg: any) => void;
    onError: () => void;
    isRequired: boolean;
    node: string;
}

interface UpSchemaArrayState {
    items: item[];
}


export default class UpSchemaArray extends React.Component<UpSchemaArrayProps, UpSchemaArrayState>   {
    constructor(p, c) {        super(p, c);
        this.state = { items: [] };
    }    render() {
        var schema: JsonSchema = this.props.schema.items as JsonSchema

        var comp = ComponentRegistery.GetComponentBySchema(schema);

        if (comp != null && comp.array === true) {
            return ComponentRegistery.GetComponentInstanceByKey(comp.key, this.props.onError, this.props.onChange, this.props.isRequired, this.props.schema);
        }

        var items = this.state.items.map((value, index, array) => {
            var type = JsonSchemaHelper.getBaseType(schema);
            var element = null;
            switch (type) {
                case "object":
                    element = <UpSchemaObject
                        withHR = {index !== 0}
                        onFormError={value.onError}
                        isRequired={this.props.isRequired}
                        SchemaArg= { schema }
                        node={""}
                        onFormChange={value.onChange} />
                    break;
                //case "array":
                //    element = <UpSchemaArray
                //        node={""}
                //        onError={null}
                //        isRequired={this.props.isRequired}
                //        schema= { schema}
                //        onChange={value.oc} />
                //    break;
                default:
                    element = ComponentRegistery.GetComponentInstance(value.onError, value.onChange, this.props.isRequired, schema);
                    break;            }

            return <div key={index}  >
                {element}
            </div>;
        });


        return <div style={{
            "borderRadius": "4px",
            "padding": "5px",
            "border": "1px solid #f4f4f4"
        }}>
            {items}
            <br/>
            <span className="btn-group">
                <button className="btn btn-default" onClick={this.AddElement }><span className="glyphicon glyphicon-plus"/></button>
                <button className="btn btn-default" disabled={this.state.items.length <= 0} onClick={this.RemoveElement }><span className="glyphicon glyphicon-minus"/></button>
            </span>
        </div >
    }

    componentDidMount = () => {
        this.AddElement();
    }


    AddElement = () => {
        var items = this.state.items;
        items.push(new item(this.onItemChange, this.onItemError));
        this.setState({ items: items });
    }
    RemoveElement = () => {
        var items = this.state.items;
        var item = items.pop();
        this.setState({ items: items }, this.onItemChange);
    }

    onItemChange = () => {
        var data = [];
        for (var i = 0; i < this.state.items.length; i++) {
            if (this.state.items[i].error === true) {
                return;
            }
            data.push(this.state.items[i].value);
        }
        this.props.onChange(data);
    }

    onItemError = () => {
        this.props.onError();
    }
}

class item {
    value = null;
    errorMemory = new ErrorMemory();
    error = false;
    constructor(public onItemChange, public onItemError) {
    }

    onChange = (arg, t?: string) => {
        if (t !== undefined) {
            if (this.value === null) {
                this.value = {};
            }
            this.errorMemory.cleanErrorOn(t);
            this.value[t.split(".")[1]] = arg;

            if (this.errorMemory.hasError === false) {
                this.onItemChange();
            }

        } else {
            this.error = false;
            this.value = arg;
            this.onItemChange();

        }

    }


    onError = (node?) => {
        if (node === undefined) {
            this.error = true;
        } else {
            this.errorMemory.errorOn(node);
        }

        this.onItemError();
    }

}




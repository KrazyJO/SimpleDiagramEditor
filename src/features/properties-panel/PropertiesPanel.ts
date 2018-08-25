//---------------------IMPORTS---------------------
import { forEach } from 'min-dash';
import * as $ from 'jquery';
import UpdatePropertiesHandler from './cmd/UpdatePropertiesHandler';
import AddPropertyHandler from './cmd/AddPropertyHandler';
import UpdateConnectionHandler from './cmd/UpdateConnectionHandler';
import { is } from '@utils/ModelUtil';
import { Base } from 'diagram-ts/model';



//---------------------CLASS--------------------
export default class PropertiesPanel {

	//---------------------CONSTRUCTOR---------------------
	constructor(config, private eventBus, private commandStack, public canvas) {
		this.init(config);
	}
 
	//---------------------METHODS---------------------
	static getCmdHandlers(): any {
		return {
			'element.addProperty' : AddPropertyHandler,
			'element.updateProperties': UpdatePropertiesHandler,
			'element.updateConnection' : UpdateConnectionHandler
		};
	}

	private static addTitle(container): void {
		const titleHtml = '<div><h4 class="text-center">Properties</h3></div><hr>'; 
		container.append(titleHtml);
	}

	public registerCmdHandlers(): void {
		forEach(PropertiesPanel.getCmdHandlers(), (handler, id) => {
			this.commandStack.registerHandler(id, handler);
		});
	}

	private init(config): void {
		const eventBus = this.eventBus;
		eventBus.on('diagram.init', () => {
			this.registerCmdHandlers();
		});
		const panel = $(config.parent);
		const events = ['element.click', 'element.dblclick', 'connection.replace', 'shape.move'];
		events.forEach(event => {
			eventBus.on(event, e => {
				if (e.element) {
					this.refreshPropertiePannel(panel, e.element);
				}
			});
		});
	}

	private refreshPropertiePannel(panel, element): void {
		panel.empty();
		// if (element.businessObject && element.businessObject.$type !== 'sdedi:SimpleDebugEditorDiagram') {
		if (element.type && element.type === 'sde:Node') {
			PropertiesPanel.addTitle(panel);
			this.addProperties(element, panel);

			//only Nodes can get new properties
			if (element.type === 'sde:Node') {
				this.addAddNewProperty(panel);
			}

			this.addButtonAddListener($('#addNewProperty'), element, panel);
		}
	}

	private addAddNewProperty(panel) : void {
		let sNewProperty = 
`<div>
	<span>add new primitive property</span>
	<input id="addNewPropertyName" placeholder="name"></input>
	<select id="addNewPropertyType">
		<option value="string">string</option>
		<option value="number">number</option>
		<option value="boolean">boolean</option>
		<option value="Array">Array</option>
	</select>
	<input placeholder="value" id="addNewPropertyValue"></input>
	<button id="addNewProperty" type="button">add</button>
</div>`;
		panel.append(sNewProperty);
	}

	private addProperties(element: Base, container): void {
		this.addElementDefaults(element, container);
		if (is(element, 'sde:Node')) {
			// Add specific node properties
		} else {
			// ADd specific edge properties
		}
	}

	private addElementDefaults(element, container) {
		let renderedMembers : string = '', disabled : string, value : string;
		let members : any[] = element.businessObject.members || [];
		
		if (element.type === 'sde:Node') {
			if (members.length > 0 ) {
	
				renderedMembers = '<div class="form-group row">';
				(members).forEach(member => {
					if (member.propType === 'Array') {
						disabled = 'disabled="disabled"';
						value = '[]';
					} else {
						disabled = '';
						value = member.value
					}
					renderedMembers += `
						<div class="row">
							<div class="col-2">
								<label for="${element.id}-member${member.id}-value" class="col-form-label-sm">${member.name}</label>
							</div>
							<div class="col-10">
								<input type="text" ${disabled} class="form-control-sm" id="${element.id}-member_${element.id}_${member.name}-value" value="${value}">
							</div>
						</div>  
					  `
				});
				renderedMembers += '</div>';
			}
		}



		const idHTML =
		`
			<fieldset class="well">
			<div class="row">
				<div class="col-2">
				<label for="${element.id}-name" class="col-form-label-sm">Connection</label>
				</div>
				<div class="col-10">
				<input type="text" class="form-control-sm" id="${element.id}-name" value="${element.businessObject.name}">
				</div>
			</div>
			<div class="row">
				<div class="col-2">
				<label for="${element.id}-class" class="col-form-label-sm">Class</label>
				</div>
				<div class="col-10">
				<input type="text" class="form-control-sm" id="${element.id}-class" value="${element.businessObject.class}">
				</div>
			</div>
			${renderedMembers}
			</fieldset>
		`;
		
		container.append(idHTML);
		// this.addIDListener($('#' + element.id + '-id'), element);
		this.addNameListener($('#' + element.id + '-class'), element);
		this.addConnectionListener($('#' + element.id + '-name'), element);

		if (element.type === 'sde:Node') {
			(members).forEach(member => {
				this.addMemberValListener($('#' + element.id+'-member'+'_'+element.id+'_'+member.name + '-value'), element, member);
			});
		}
	}

	private addButtonAddListener(node, element, panel): void {
		node.bind({
			click : () => {
				// grap informations from panel
				let ePropName : any = document.getElementById('addNewPropertyName');
				let ePropValue : any = document.getElementById('addNewPropertyValue');
				let ePropType : any = document.getElementById('addNewPropertyType');
				
				// execute command to add new property
				this.commandStack.execute('element.addProperty', {
					node : node,
					element : element,
					property : {
						name : ePropName.value,
						type : ePropType.selectedOptions[0].value,
						value : String(ePropValue.value)
					}
				});
				this.refreshPropertiePannel(panel, element);
			}
		});
		
	}
	
	private addMemberValListener(node, element, member) : void {
		node.bind({
			input : () => {
				this.commandStack.execute('element.updateProperties', {
					member : member,
					element: element,
					properties: { value: node.val() }
				});
			}
		});
	}

	// private addIDListener(node, element): void {
	// 	node.bind({
	// 		input: () => {
	// 			this.commandStack.execute('element.updateProperties', {
	// 				element: element,
	// 				properties: { id: node.val() }
	// 			});
	// 		}
	// 	});
	// }

	private addNameListener(node, element): void {
		node.bind({
			input: () => {
				this.commandStack.execute('element.updateLabel', {
					element: element,
					newLabel: node.val()
				});
			}
		});
	}

	private addConnectionListener(node, element): void {
		node.bind({
			input: () => {
				this.commandStack.execute('element.updateConnection', {
					element: element,
					newLabel: node.val()
				});
			}
		});
	}
}

(PropertiesPanel as any).$inject = ['config.propertiesPanel', 'eventBus', 'commandStack', 'canvas'];

//---------------------IMPORTS---------------------
import { forEach } from 'min-dash';
import * as $ from 'jquery';
import UpdatePropertiesHandler from './cmd/UpdatePropertiesHandler';
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
			'element.updateProperties': UpdatePropertiesHandler
		};
	}

	private static addTitle(container): void {
		const titleHtml = '<div><h3 class="text-center">Properties</h3></div><hr>'; 
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
		if (element.businessObject && element.businessObject.$type !== 'sdedi:SimpleDebugEditorDiagram') {
			PropertiesPanel.addTitle(panel);
			this.addProperties(element, panel);
			this.addAddNewProperty(panel);
			this.addButtonAddListener($('#addNewProperty'), element);
		}
	}

	private addAddNewProperty(panel) : void {
		let sNewProperty = 
`<div>
	<span>add new primitive property</span>
	<input id="addNewPropertyName" placeholder="name"></input>
	<select id="addNewPropertyType">
		<option value="boolean">boolean</option>
		<option value="number">number</option>
		<option value="string">string</option>
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
		let members : any[] = element.businessObject.members || [];
		let renderedMembers : string = '';

		if (members.length > 0 )
		{
			renderedMembers = '<div class="form-group row">';
			(members).forEach(member => {
				renderedMembers += `
					<div class="row">
						<div class="col-2">
							<label for="${element.id}-member${member.id}-value" class="col-form-label-sm">${member.name}</label>
						</div>
						<div class="col-10">
							<input type="text" class="form-control-sm" id="${element.id}-member_${element.id}_${member.name}-value" value="${member.value}">
						</div>
					</div>  
				  `
			});
			renderedMembers += '</div>';
		}

		const idHTML =
			`
				<fieldset class="well">
				<legend class="well-legend">${is(element, 'sde:Node') ? 'Node' : 'Edge'}</legend>
				<div class="form-group row">
					<div class="col-2">
					<label for="${element.id}-id" class="col-form-label-sm">ID</label>
					</div>
					<div class="col-10">
					<input type="text" class="form-control-sm" id="${element.id}-id" value="${element.businessObject.id}" disabled>
					</div>
				</div>
				<br/>
				<div class="form-group row">
					<div class="col-2">
					<label for="${element.id}-name" class="col-form-label-sm">Name</label>
					</div>
					<div class="col-10">
					<input type="text" class="form-control-sm" id="${element.id}-name" value="${element.businessObject.name}">
					</div>
				</div>
				${renderedMembers}
				</fieldset>
			`;
		container.append(idHTML);
		this.addIDListener($('#' + element.id + '-id'), element);
		this.addNameListener($('#' + element.id + '-name'), element);
		(members).forEach(member => {
			this.addMemberValListener($('#' + element.id+'-member'+'_'+element.id+'_'+member.name + '-value'), element, member);
		});
	}

	private addButtonAddListener(node, element): void {
		node.bind({
			click : () => {
				console.log(element);
				let ePropName : any = document.getElementById('addNewPropertyName');
				let ePropValue : any = document.getElementById('addNewPropertyValue');
				let ePropType : any = document.getElementById('addNewPropertyType');
				console.log("name: " + ePropName.value)
				console.log("value: " + ePropValue.value);
				console.log("type: " + ePropType.selectedOptions[0].value);
			}
		})
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

	private addIDListener(node, element): void {
		node.bind({
			input: () => {
				this.commandStack.execute('element.updateProperties', {
					element: element,
					properties: { id: node.val() }
				});
			}
		});
	}

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
}

(PropertiesPanel as any).$inject = ['config.propertiesPanel', 'eventBus', 'commandStack', 'canvas'];

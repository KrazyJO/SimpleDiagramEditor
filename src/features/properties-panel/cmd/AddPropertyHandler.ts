//---------------------IMPORTS---------------------
import EasyFactory from '../../modeling/EasyFactory';


//---------------------CLASS---------------------
export default class AddPropertyHandler {

	//---------------------CONSTRUCTOR---------------------
	constructor(private moddle) { }

	//---------------------METHODS---------------------
	execute(context) {
		const element = context.element;
		const changed = [element];
		const node = context.node
		const property = context.property;
		if (!element) {
			throw new Error('element required');
		}
		
		let found = false;
		// on new properties members array do not exist
		if (!element.businessObject.members)
		{
			element.businessObject.members = [];
		}
		for (let i = 0; i < element.businessObject.members.length; i++) {
			if (element.businessObject.members[i].name === property.name) {
				found = true;
				break;
			}
		}

		if (found) {
			let message = 'this property is already exsisting';
			alert(message)
			throw new Error(message);
		}
		
		
		// let factory = new EasyFactory((window as any).app.getModeler().moddle);
		let factory = new EasyFactory(this.moddle);
		let member = factory.create('sde:Member', undefined);
		member.$parent = node;
		member.name = property.name;
		member.propType = property.type;
		member.value = property.value;

		element.businessObject.members.push(member);

		//store added member for revert
		context.addedMember = member;

		// indicate changed on objects affected by the update
		context.changed = changed;

		

		return changed;
	}

	revert(context) {
		const addedMember = context.addMember;
		const element = context.element
		for (let i = 0; i < element.businessObject.members.length; i++)
		{
			if (element.businessObject.members[i] === addedMember)
			{
				element.businessObject.members.splice(i,1); //remove this object
			}
		}
		return context.changed;
	}
}

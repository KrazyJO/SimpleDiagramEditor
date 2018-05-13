export function is(element : any, type : any) {
	const bo = getBusinessObject(element);
	return bo && (typeof bo.$instanceOf === 'function') && bo.$instanceOf(type);
  }
  
  export function getBusinessObject(element : any) {
	return (element && element.businessObject) || element;
  }
  
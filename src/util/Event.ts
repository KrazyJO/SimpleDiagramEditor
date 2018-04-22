function __stopPropagation(event: any, immediate: boolean): void {
	if (!event || typeof event.stopPropagation !== 'function') {
		return;
	}

	event.stopPropagation();
}


export function getOriginal(event: any): any {
	return event.originalEvent || event.srcEvent;
}


export function stopPropagation(event: any, immediate: boolean) {
	__stopPropagation(event, immediate);
	__stopPropagation(getOriginal(event), immediate);
}


export function toPoint(event: any): any {

	if (event.pointers && event.pointers.length) {
		event = event.pointers[0];
	}

	if (event.touches && event.touches.length) {
		event = event.touches[0];
	}

	return event ? {
		x: event.clientX,
		y: event.clientY
	} : null;
}
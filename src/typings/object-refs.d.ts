// Type definitions for object-refs 0.1.1
// Project: https://github.com/bpmn-io/object-refs
// Definitions by: Jan Steinbruecker <https://github.com/3fd>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

declare class Refs {
    props: any;
    constructor(a: Refs.AttributeDescriptor, b: Refs.AttributeDescriptor);
    bind(target: any, property: string|Refs.AttributeDescriptor): void;
    ensureBound(target: any, property: string|Refs.AttributeDescriptor): void;
    ensureRefsCollection(target: any, property: Refs.AttributeDescriptor): any;
    set(target: any, property: string|Refs.AttributeDescriptor, value: any): void;
    unset(target: any, property: string|Refs.AttributeDescriptor, value: any): void;
}

declare namespace Refs {

    export interface AttributeDescriptor {
        name: string;
        collection?: boolean;
        enumerable?: boolean;
    }

    export interface RefsCollection {

        /**
         * Extends a collection with {@link Refs} aware methods
         * @param  {Array<Object>} collection
         * @param  {Refs} refs instance
         * @param  {Object} property represented by the collection
         * @param  {Object} target object the collection is attached to
         * @return {RefsCollection<Object>} the extended array
         */
        extend(collection: any[], refs: Refs, property: string|AttributeDescriptor, target: any): RefsCollection;

        /**
         * Extends a collection with {@link Refs} aware methods
         * @param  {Array<Object>} collection
         * @return {boolean} the extended array
         */
        isExtended(collection: any[]): boolean;

    }

}

declare module 'object-refs' {
    export default Refs;
}

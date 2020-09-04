export enum MutationType {
    'newCategory' = 'category',
    'newPoints' = 'points',
    'newName' = 'name',
    'IS_DUPLICATE' = 'IS_DUPLICATE'
}

export type Mutation = {
    name: string;
    column: MutationType;
    newValue?: string | number;
}
import type { Schema, Struct } from '@strapi/strapi';

export interface BasicKey extends Struct.ComponentSchema {
  collectionName: 'components_basic_keys';
  info: {
    displayName: 'Key';
    icon: 'key';
  };
  attributes: {
    code: Schema.Attribute.String;
    duration: Schema.Attribute.Integer;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'basic.key': BasicKey;
    }
  }
}

declare namespace Reflect {
  function getMetadata<T>(metadataKey: any, target: object): T;
  function getMetadata<T>(metadataKey: any, target: object, propertyKey: string | symbol): T;
}

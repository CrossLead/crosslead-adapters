export default function rateLimitDecorator<T>(rate?: number, count?: number): (target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => TypedPropertyDescriptor<any>;

/**
 * Temporary type declarations for drizzle-orm
 * This file provides type definitions when drizzle-orm modules cannot be resolved
 */

declare module "drizzle-orm/pg-core" {
    export function pgTable<T extends string>(
        name: T,
        columns: Record<string, any>,
        extraConfig?: (table: any) => Record<string, any>
    ): any;

    export function serial(name: string): any;
    export function integer(name: string): any;
    export function text(name: string): any;
    export function varchar(name: string, config?: any): any;
    export function timestamp(name: string, config?: any): any;
    export function boolean(name: string): any;
    export function pgEnum<T extends string>(name: string, values: readonly T[]): any;
    export function index(name: string): any;
    export function unique(name: string): any;
}

declare module "drizzle-orm" {
    export function relations<T>(table: T, callback: (helpers: any) => any): any;
    export function eq(column: any, value: any): any;
    export function and(...conditions: any[]): any;
    export function or(...conditions: any[]): any;
    export function lt(column: any, value: any): any;
    export function gt(column: any, value: any): any;
    export function isNull(column: any): any;
    export function desc(column: any): any;
}

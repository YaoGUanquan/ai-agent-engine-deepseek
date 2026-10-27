export declare const roleKeys: {
    readonly lead: "role.lead";
    readonly requirements: "role.requirements";
    readonly frontend: "role.frontend";
    readonly backend: "role.backend";
    readonly 'unit-test': "role.unit-test";
    readonly 'integration-test': "role.integration-test";
    readonly 'browser-test': "role.browser-test";
    readonly 'e2e-engineer': "role.e2e-engineer";
};
export type RoleKey = typeof roleKeys[keyof typeof roleKeys];
/** Names remain official routing identities; only their presentation changes. */
export declare function roleLabel(name: string, translate: (key: RoleKey) => string): string;
interface TeamPresentation {
    readonly members: readonly {
        readonly name: string;
    }[];
    readonly tasks: readonly {
        readonly ownerName?: string;
    }[];
}
/** Preserve reference identity between store reads, without rewriting host data. */
export declare function createRolePresentation(translate: (key: RoleKey) => string): <T extends TeamPresentation>(team: T) => T;
export {};

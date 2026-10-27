/** Limits Discord enforces on commands, components and modals. The builders throw a `TypeError` when one is exceeded. */
export const BuilderLimits = {
    CommandOptions: 25,
    CommandChoices: 25,
    ActionRows: 5,
    ActionRowButtons: 5,
    MessageComponents: 40,
    SectionTextDisplays: 3,
    MediaGalleryItems: 10,
    ModalComponents: 5,
    ModalTitleLength: 45,
    CustomIdLength: 100
} as const;

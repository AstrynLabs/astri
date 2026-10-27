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
    CustomIdLength: 100,
    EmbedTitleLength: 256,
    EmbedDescriptionLength: 4096,
    EmbedFields: 25,
    EmbedFieldNameLength: 256,
    EmbedFieldValueLength: 1024,
    EmbedFooterTextLength: 2048,
    EmbedAuthorNameLength: 256,
    EmbedTotalLength: 6000
} as const;

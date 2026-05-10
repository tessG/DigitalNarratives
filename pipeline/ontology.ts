export const NAR = 'http://narratives.poc/ontology#'

export const TAGS = [
    // NarrativeRole — who plays which role in the story being told
    { uri: `${NAR}Hero`,             label: 'Hero',              class: 'NarrativeRole',     description: 'An actor framed as morally good, brave, or righteous — the one doing the right thing.' },
    { uri: `${NAR}Villain`,          label: 'Villain',           class: 'NarrativeRole',     description: 'An actor framed as the source of wrongdoing, oppression, or injustice.' },
    { uri: `${NAR}Victim`,           label: 'Victim',            class: 'NarrativeRole',     description: 'An actor framed as suffering harm, injustice, or loss at the hands of others.' },
    { uri: `${NAR}Helper`,           label: 'Helper',            class: 'NarrativeRole',     description: 'An actor who supports or aids the hero or victim without being the central protagonist.' },
    { uri: `${NAR}Opponent`,         label: 'Opponent',          class: 'NarrativeRole',     description: 'An actor who obstructs progress or opposes the hero, short of being the main villain.' },
    { uri: `${NAR}Sender`,           label: 'Sender',            class: 'NarrativeRole',     description: 'An actor who issues a call to action, mandate, or mission — often an institution or movement.' },

    // FramingFunction — how the post structures the problem and response
    { uri: `${NAR}ProblemDefinition`,  label: 'Problem Definition',  class: 'FramingFunction', description: 'The post defines or names a problem, injustice, or issue that needs addressing.' },
    { uri: `${NAR}CausalAttribution`,  label: 'Causal Attribution',  class: 'FramingFunction', description: 'The post assigns blame or explains what caused the problem.' },
    { uri: `${NAR}MoralJudgement`,     label: 'Moral Judgement',     class: 'FramingFunction', description: 'The post passes a moral verdict — labelling something as right, wrong, good, or evil.' },
    { uri: `${NAR}RemedySuggestion`,   label: 'Remedy Suggestion',   class: 'FramingFunction', description: 'The post proposes or calls for a solution, action, or change.' },

    // AffectiveRegister — dominant emotional tone
    { uri: `${NAR}Outrage`,    label: 'Outrage',    class: 'AffectiveRegister', description: 'Expressed anger or moral indignation at an injustice.' },
    { uri: `${NAR}Solidarity`, label: 'Solidarity', class: 'AffectiveRegister', description: 'Expressed unity, support, or collective belonging.' },
    { uri: `${NAR}Disgust`,    label: 'Disgust',    class: 'AffectiveRegister', description: 'Expressed revulsion or contempt toward a person, group, or act.' },
    { uri: `${NAR}Fear`,       label: 'Fear',       class: 'AffectiveRegister', description: 'Expressed anxiety, dread, or concern about a threat.' },
    { uri: `${NAR}Shame`,      label: 'Shame',      class: 'AffectiveRegister', description: 'Expressed shame, embarrassment, or humiliation — directed inward or at an in-group.' },

    // CausalStructure — what the post treats as the root cause
    { uri: `${NAR}SystemicCause`,   label: 'Systemic Cause',   class: 'CausalStructure', description: 'The problem is rooted in structures, systems, institutions, or historical patterns.' },
    { uri: `${NAR}IndividualCause`, label: 'Individual Cause', class: 'CausalStructure', description: 'The problem is attributed to specific individuals and their choices or character.' },
    { uri: `${NAR}ExternalCause`,   label: 'External Cause',   class: 'CausalStructure', description: 'The problem is attributed to outside forces — foreign actors, other groups, or circumstances beyond the community.' },
] as const

export type TagUri = typeof TAGS[number]['uri']

export function ontologyPrompt(): string {
    const byClass = TAGS.reduce<Record<string, typeof TAGS[number][]>>((acc, t) => {
        (acc[t.class] ??= []).push(t)
        return acc
    }, {})

    return Object.entries(byClass).map(([cls, tags]) =>
        `${cls}:\n` + tags.map(t => `  - ${t.label}: ${t.description}`).join('\n')
    ).join('\n\n')
}

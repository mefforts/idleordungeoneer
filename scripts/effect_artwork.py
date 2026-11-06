"""Authored encounter illustrations. Coordinates share a ground anchor at (0, 0).

Material color is secondary to the runtime's danger/counter boundary. Keep the
silhouette readable at 32–80 px; small engraving is supporting detail only.
"""

ILLUSTRATIONS = {
    'root': '''
<path d="M-49 7Q-43-8-21-17L-8-21L7-14Q23-11 49 5L27 7L8 0L-9 4L-30 10Z" fill="url(#wood)" stroke="{dark}" stroke-width="3"/>
<path d="M-23 1C-44-21-25-40-20-53C-13-71-31-84-26-104C-9-94 3-76-5-54C-15-32-22-22-9-4Z" fill="url(#wood)" stroke="{dark}" stroke-width="3"/>
<path d="M-8-5C-2-29 24-36 22-56Q19-75 33-94Q51-73 41-54C32-33 14-25 20-3Z" fill="url(#wood)" stroke="{dark}" stroke-width="3"/>
<path d="M-14-12Q-30-31-13-54Q-2-77-22-97M5-10Q2-27 28-52Q43-74 34-86" fill="none" stroke="{light}" stroke-width="3"/>
<path d="M-20-48L-47-61L-36-38M21-47L51-57L35-32M-7-70L12-91L3-65" fill="url(#wood)" stroke="{dark}" stroke-width="2"/>
<path d="M-27-75Q-51-92-51-67Q-40-63-27-75M31-76Q51-101 56-77Q46-67 31-76" fill="url(#leaf)" stroke="{dark}" stroke-width="2"/>
<path d="M-48-74L-31-75M36-77L50-83M-28-28L-20-31M-14-62L-8-64M24-38L30-40" fill="none" stroke="{edge}" stroke-width="1.4"/>
<path d="M-15-4L-35 4M-6-7L-11 1M14-9L34 3" stroke="{accent}" stroke-width="2"/>
''',
    'pod': '''
<path d="M-9 2Q-17-11-28-14M8 0Q23-8 29-7M0-5L2-75" fill="none" stroke="{dark}" stroke-width="8"/>
<path d="M0-5L2-75" stroke="url(#wood)" stroke-width="4"/>
<path d="M-3-60Q-38-77-47-47Q-25-39-3-60M4-65Q30-93 40-62Q26-46 4-65" fill="url(#leaf)" stroke="{dark}" stroke-width="2.5"/>
<path d="M-34-37Q-39-80-7-96Q21-102 38-65Q49-31 24-10L-16-6Z" fill="{dark}" stroke="{accent}" stroke-width="2"/>
<ellipse cx="1" cy="-49" rx="21" ry="34" fill="url(#core)"/>
<path d="M-10-94Q-43-84-38-46Q-36-16-16-7L-5-33L-14-56L-5-78Z" fill="url(#leaf)" stroke="{dark}" stroke-width="3"/>
<path d="M8-96Q40-84 41-51Q41-22 22-9L9-31L18-57L7-77Z" fill="url(#body)" stroke="{dark}" stroke-width="3"/>
<path d="M-15-83Q-29-61-24-39M21-79Q32-57 25-33" fill="none" stroke="{edge}" stroke-width="2"/>
<path d="M-24-65L-40-72L-32-55M29-61L45-65L36-49M-20-28L-32-35L-24-18" fill="{light}" stroke="{dark}" stroke-width="1.5"/>
<ellipse cx="0" cy="-54" rx="5" ry="10" fill="{edge}"/><path d="M-2-36L3-29L7-36M-4-72L1-78L6-72" fill="none" stroke="{edge}" stroke-width="2"/>
''',
    'mushroom': '''
<path d="M-15 0Q-7-20-14-49L11-54Q7-20 21-2Q5 8-15 0Z" fill="url(#bone)" stroke="{dark}" stroke-width="3"/>
<path d="M-47-48C-48-76-26-101-3-103C27-103 46-80 51-49L32-33L-29-34Z" fill="url(#leaf)" stroke="{dark}" stroke-width="3"/>
<path d="M-47-48Q-1-23 51-49Q31-30 1-29Q-31-30-47-48Z" fill="url(#bone)" stroke="{dark}" stroke-width="2.5"/>
<path d="M-37-46L-17-34M-23-43L-10-32M-8-40L-4-31M9-40L5-31M25-43L13-33M41-47L24-35" stroke="{base}" stroke-width="2"/>
<path d="M-39-63Q-24-92-3-96Q25-98 39-76" fill="none" stroke="{edge}" stroke-width="2"/>
<path d="M-22-84L-31-76L-23-69L-12-77ZM8-92L2-82L12-78L19-87ZM30-75L22-65L35-61L42-66ZM-3-67L-10-57L4-54L13-62Z" fill="{edge}" stroke="{base}" stroke-width="1.5"/>
<path d="M-9-31L11-30L15-21Q-1-14-13-22Z" fill="{light}" stroke="{dark}" stroke-width="2"/>
<path d="M-2-14L0-3M10-12L12-4" stroke="{base}" stroke-width="1.5"/>
''',
    'sapling': '''
<path d="M-34 5L-13-10L-9-53L-30-73L-24-83L-5-66L0-106L10-109L9-61L28-79L36-74L11-43L16-10L39 4L19 7L4-1L-8 6L-19 3Z" fill="url(#wood)" stroke="{dark}" stroke-width="3"/>
<path d="M-5-10L1-50L3-95M8-37L26-69M-5-55L-24-75" stroke="{light}" stroke-width="2" fill="none"/>
<path d="M-18-74Q-52-106-57-75Q-47-53-18-74M10-89Q23-118 43-102Q52-80 10-89M17-54Q45-88 55-58Q43-38 17-54" fill="url(#leaf)" stroke="{dark}" stroke-width="2.5"/>
<path d="M-49-79L-26-75M18-92L37-102M25-57L48-64" stroke="{edge}" stroke-width="1.5"/>
<path d="M-9-38L-2-34L-8-31M8-38L2-34L8-31" stroke="{dark}" stroke-width="2.5" fill="none"/>
<path d="M-2-26L2-20L5-27" fill="{accent}"/><path d="M-13-8L-24 2M13-8L25 2" stroke="{edge}" stroke-width="1.4"/>
''',
    'branch': '''
<path d="M-57-21L-37-35L-18-37L7-60L40-73L55-65L57-49L22-40L-10-19L-42-10Z" fill="url(#wood)" stroke="{dark}" stroke-width="3"/>
<path d="M-56-22L-39-29L-16-31L10-53L42-64L53-61M-45-17L-12-25L17-47" fill="none" stroke="{light}" stroke-width="2"/>
<path d="M-17-37L-28-65L-20-83L-14-64L-4-50M16-51L15-85L24-96L27-62M31-45L52-34L57-39L42-53" fill="url(#wood)" stroke="{dark}" stroke-width="2.5"/>
<ellipse cx="-48" cy="-21" rx="8" ry="10" transform="rotate(-29 -48 -21)" fill="{light}" stroke="{dark}" stroke-width="2"/><ellipse cx="-48" cy="-21" rx="3" ry="5" fill="{base}"/>
<path d="M-22-71Q-47-95-46-70Q-34-59-22-71M22-87Q40-112 49-88Q40-72 22-87M44-44Q63-56 61-30Q52-25 44-44" fill="url(#leaf)" stroke="{dark}" stroke-width="2"/>
<path d="M-21-70L-38-78M27-88L42-93M48-40L57-35M-30-27L-25-21M3-42L7-34M28-54L33-47" stroke="{edge}" stroke-width="1.4"/>
''',
    'seed': '''
<path d="M-5-14Q-49-22-38-57Q-30-85 16-99Q47-81 36-51Q28-23-5-14Z" fill="url(#wood)" stroke="{dark}" stroke-width="3"/>
<path d="M-4-18Q-21-43 14-94Q30-80 21-59Q-6-43-4-18Z" fill="url(#leaf)" stroke="{dark}" stroke-width="2"/>
<path d="M-27-58Q-29-75 8-90M3-30Q30-49 29-70" stroke="{edge}" stroke-width="2.5" fill="none"/>
<path d="M-25-34L-43-29L-35-46M26-36L43-34L35-51" fill="{light}" stroke="{dark}" stroke-width="2"/>
<ellipse cx="-8" cy="-51" rx="7" ry="11" transform="rotate(29 -8 -51)" fill="url(#core)"/><path d="M-17-17Q-22-6-34-2M-2-16L-4-3" stroke="{base}" stroke-width="3" fill="none"/>
''',
    'vent': '''
<path d="M-51-22L-43-39L-18-50L20-50L46-36L53-20L48-6L24 6L-24 6L-48-7Z" fill="url(#metal)" stroke="{dark}" stroke-width="3"/>
<ellipse cx="0" cy="-23" rx="46" ry="23" fill="{dark}" stroke="{light}" stroke-width="3"/>
<ellipse cx="0" cy="-24" rx="37" ry="16" fill="url(#core)"/>
<path d="M-35-30L-30-14M-22-37L-16-9M-8-40L-2-7M7-39L13-8M22-35L28-13M35-29L39-18" stroke="{dark}" stroke-width="8"/>
<path d="M-35-31L-30-16M-22-37L-16-11M-8-40L-2-9M7-39L13-10M22-35L28-15M35-29L39-20" stroke="url(#metal)" stroke-width="4"/>
<path d="M-45-16Q0 8 47-17M-35 0L-33 7M-18 5L-16 10M18 5L16 10M34 0L32 7" stroke="{edge}" stroke-width="2" fill="none"/>
<g fill="{edge}" stroke="{dark}" stroke-width="1.5"><circle cx="-43" cy="-26" r="3"/><circle cx="-26" cy="-42" r="3"/><circle cx="25" cy="-42" r="3"/><circle cx="44" cy="-25" r="3"/><circle cx="0" cy="-4" r="3"/></g>
''',
    'anchor': '''
<path d="M-11-2L-12-74L11-74L10-2L27-21L29-36L45-27L38-4L13 11L-15 11L-42-8L-49-31L-31-38L-29-22Z" fill="url(#metal)" stroke="{dark}" stroke-width="4"/>
<path d="M-35-28L-31-11L-12 3M34-27L30-9L12 3M-3-69L-3-20" stroke="{edge}" stroke-width="2.5" fill="none"/>
<path d="M-18-80Q-20-106-1-108Q22-108 18-81L7-76L-9-77Z" fill="url(#metal)" stroke="{dark}" stroke-width="3"/>
<ellipse cx="0" cy="-93" rx="9" ry="10" fill="{dark}" stroke="{edge}" stroke-width="2"/>
<path d="M-28-65L28-65L31-50L-29-50Z" fill="{base}" stroke="{dark}" stroke-width="3"/>
<path d="M-28-64L27-64L21-59L-23-59Z" fill="{light}"/><path d="M0-57L13-43L0-25L-13-43Z" fill="{dark}" stroke="{light}" stroke-width="2"/>
<path d="M0-51L7-43L0-32L-7-43Z" fill="url(#core)"/><path d="M-19-62L-19-53M19-62L19-53" stroke="{edge}" stroke-width="2"/>
<circle cx="-20" cy="1" r="3" fill="{edge}"/><circle cx="21" cy="0" r="3" fill="{edge}"/>
''',
    'droplet': '''
<path d="M1-109C14-77 5-75 27-58C55-38 48-12 24-2C-1 9-34-3-38-27C-44-50-13-65 1-109Z" fill="url(#core)" stroke="{dark}" stroke-width="3"/>
<path d="M-17-56L-28-40L-24-20L-9-9L11-8L31-23L30-39L15-54L-4-59Z" fill="url(#metal)" stroke="{dark}" stroke-width="2.5"/>
<path d="M-18-49L-7-38L-12-21L2-14M-7-38L11-49L17-32L29-26M16-32L3-28L2-14" stroke="{accent}" stroke-width="5" fill="none"/>
<path d="M-17-48L-7-38L-12-21M11-48L17-32L4-28" stroke="{edge}" stroke-width="1.8" fill="none"/>
<path d="M-25-59Q-26-80-9-91Q-15-71-8-65M22-66Q39-72 34-91Q49-72 34-53" fill="{light}" opacity=".8"/>
''',
    'stone': '''
<path d="M-54-19L-45-42L-16-63L18-63L44-44L55-19L37 4L-27 7Z" fill="url(#body)" stroke="{dark}" stroke-width="3"/>
<path d="M-48-24L-40-39L-13-56L17-56L40-39L46-23L18-11L-17-12Z" fill="url(#metal)" stroke="{dark}" stroke-width="2"/>
<path d="M-13-55L-6-38L-20-27L-15-13M-6-38L15-36L25-49M15-36L28-22L42-27M-41-39L-26-33" fill="none" stroke="{dark}" stroke-width="3"/>
<path d="M-12-53L-5-38L-18-27M16-35L29-22" fill="none" stroke="{edge}" stroke-width="1.3"/>
<path d="M-46-13L-26-1L12-2M-20 2L-14 5M29-9L43-17" fill="none" stroke="{light}" stroke-width="2"/>
<path d="M-38-31L-28-40L-20-38L-30-28ZM13-24L22-27L30-21L19-18Z" fill="{light}" opacity=".65"/>
''',
    'needle': '''
<path d="M-51-7L-38-31L25-97Q36-111 48-101Q56-91 43-78L-21-16Z" fill="url(#metal)" stroke="{dark}" stroke-width="3"/>
<path d="M-46-14L36-99M-35-28L33-94" stroke="{edge}" stroke-width="2"/>
<path d="M32-94Q38-102 44-95Q48-90 40-84Z" fill="{dark}" stroke="{light}" stroke-width="1.5"/>
<path d="M37-91Q22-113 7-100Q-1-90 8-80Q20-68 3-56Q-7-49-11-59" fill="none" stroke="{dark}" stroke-width="6"/>
<path d="M37-91Q22-113 7-100Q-1-90 8-80Q20-68 3-56Q-7-49-11-59" fill="none" stroke="{accent}" stroke-width="3"/>
<path d="M-23-35L-16-29M-11-48L-5-42M1-61L7-55M13-74L19-68" stroke="{base}" stroke-width="2.5"/>
''',
    'coffin': '''
<path d="M-35-94L-17-111L23-108L41-84L29-2L-26 4L-44-26Z" fill="url(#wood)" stroke="{dark}" stroke-width="4"/>
<path d="M-35-94L-18-109L23-106L36-85L24-9L-23-3L-39-28Z" fill="url(#metal)" stroke="{dark}" stroke-width="2"/>
<path d="M-27-86L-13-100L17-98L29-80L18-16L-17-12L-31-32Z" fill="url(#wood)" stroke="{light}" stroke-width="2"/>
<path d="M-12-96L-12-19M2-97L0-18M16-91L10-20" stroke="{dark}" stroke-width="2"/>
<path d="M-17-75Q-2-88 14-73L15-57L8-50L6-39L-6-38L-9-49L-18-55Z" fill="url(#bone)" stroke="{dark}" stroke-width="2"/>
<path d="M-12-65L-4-61L-10-57M4-62L11-66L9-57M-2-53L2-53L0-48M-5-43L6-44" fill="{dark}" stroke="{dark}" stroke-width="2"/>
<path d="M-33-89L-22-87M23-88L34-85M-35-34L-24-35M18-26L30-28" stroke="{dark}" stroke-width="9"/>
<path d="M-33-91L-22-89M23-90L34-87M-35-36L-24-37M18-28L30-30" stroke="{light}" stroke-width="5"/>
<path d="M-30-95L-20-101M27-84L22-54M-22-8L18-12" stroke="{edge}" stroke-width="1.5" fill="none"/>
<path d="M-16-28L-6-30L-5-22L-15-21M5-30L14-32L13-24L4-22" fill="{accent}" opacity=".75"/>
''',
    'rib': '''
<path d="M-4 2Q-16-16-9-40Q-1-62-5-85L-9-108L3-112L11-86Q15-63 5-38Q0-17 10-3Z" fill="url(#bone)" stroke="{dark}" stroke-width="3"/>
<path d="M-3-91C-39-107-52-85-46-65Q-42-51-19-51M1-69C-31-84-41-65-34-49Q-29-39-13-36M4-45C31-61 45-49 41-31Q37-17 15-17M1-89C38-103 54-84 46-65Q42-51 20-48M3-66C27-76 40-65 34-50Q31-41 16-37" fill="none" stroke="{dark}" stroke-width="11" stroke-linecap="round"/>
<path d="M-3-91C-39-107-52-85-46-65Q-42-51-19-51M1-69C-31-84-41-65-34-49Q-29-39-13-36M4-45C31-61 45-49 41-31Q37-17 15-17M1-89C38-103 54-84 46-65Q42-51 20-48M3-66C27-76 40-65 34-50Q31-41 16-37" fill="none" stroke="url(#bone)" stroke-width="7" stroke-linecap="round"/>
<path d="M-39-87Q-48-76-40-65M25-89Q40-93 44-82M30-47Q40-42 34-32M-23-65Q-34-61-29-52" stroke="{edge}" stroke-width="1.8" fill="none"/>
<path d="M-7-91L4-93M-5-73L7-74M-8-52L5-54M-10-31L2-32M-6-14L4-15" stroke="{base}" stroke-width="3"/>
''',
    'lantern': '''
<path d="M-10-88Q-20-113 0-114Q22-113 11-88" fill="none" stroke="{dark}" stroke-width="7"/>
<path d="M-10-88Q-20-113 0-114Q22-113 11-88" fill="none" stroke="{light}" stroke-width="3"/>
<path d="M-31-66L-20-87L0-96L21-85L33-65L25-9L-24-8Z" fill="url(#metal)" stroke="{dark}" stroke-width="3"/>
<path d="M-22-63L-14-73L16-73L24-61L17-21L-15-20Z" fill="{dark}" stroke="{light}" stroke-width="2"/>
<ellipse cx="0" cy="-49" rx="19" ry="25" fill="url(#core)"/>
<path d="M-11-50Q-14-70 0-70Q16-68 12-51L6-43L6-35L-6-35L-7-43Z" fill="url(#bone)" stroke="{dark}" stroke-width="1.5"/>
<path d="M-8-57L-2-54L-7-50M4-54L9-58L8-50M-4-40L5-40" fill="{dark}" stroke="{dark}" stroke-width="1.7"/>
<path d="M-30-66L0-86L32-65M-25-13L26-13M-16-72L-13-22M15-71L13-22" fill="none" stroke="{light}" stroke-width="4"/>
<path d="M-31-68L0-91L33-67M-29-6L29-6M-20-3L-22 3M20-3L23 3" fill="none" stroke="{edge}" stroke-width="2"/>
<circle cx="-24" cy="-61" r="2.5" fill="{edge}"/><circle cx="25" cy="-61" r="2.5" fill="{edge}"/>
''',
    'ghost': '''
<path d="M-31-8C-21-27-38-40-31-68C-28-92-11-109 7-106C35-99 36-75 29-54C24-37 39-21 49-9Q22-13 13-1L0-13L-17 5L-19-12Z" fill="url(#spirit)" stroke="{dark}" stroke-width="2.5"/>
<path d="M-25-60Q-26-89 0-99Q27-89 25-61L12-48L-12-47Z" fill="{dark}" stroke="{base}" stroke-width="2"/>
<path d="M-15-71Q-11-84 2-85Q16-81 16-67L9-57L9-49L-6-48L-10-58Z" fill="url(#bone)"/>
<path d="M-11-69L-2-64L-8-60M6-64L13-69L12-61M-3-53L6-54" fill="{dark}" stroke="{dark}" stroke-width="2.5"/>
<path d="M-28-56Q-43-52-52-33L-40-36L-43-25L-27-36M27-56Q42-53 52-37L41-38L46-25L27-36" fill="url(#bone)" stroke="{dark}" stroke-width="2"/>
<path d="M-22-44Q-29-25-24-15M-9-40Q-15-16-10-5M10-40Q7-19 18-12M21-46Q19-31 31-21" stroke="{edge}" stroke-width="2" fill="none" opacity=".65"/>
<path d="M-34-20Q-48-14-46-1M30-10Q44-1 40 10M-4-8Q-5 8-15 13" fill="none" stroke="{accent}" stroke-width="2.5" opacity=".65"/>
''',
    'wisp': '''
<path d="M-39-1C-14-26-43-42-27-69Q-12-97 14-106Q5-89 23-86Q47-84 41-60Q38-39 12-39Q-5-38 0-23Q5-12 22-8L4-5L-6 8L-17-3Z" fill="url(#spirit)" stroke="{dark}" stroke-width="2.5"/>
<path d="M-15-65Q-18-86 3-87Q25-87 27-68L18-54L16-45L-1-44L-6-53Z" fill="url(#bone)" stroke="{base}" stroke-width="1.5"/>
<path d="M-10-71L0-65L-6-60M10-65L20-73L19-62M1-51L12-52" fill="{dark}" stroke="{dark}" stroke-width="2.4"/>
<path d="M-21-51Q-28-32-17-24M19-35Q1-25 15-17M-16-7Q-23 5-31 4" fill="none" stroke="{edge}" stroke-width="2" opacity=".7"/>
''',
    'clock': '''
<path d="M-30 3L-25-48L-20-84L-7-108L9-108L23-86L28-46L35 3Z" fill="url(#metal)" stroke="{dark}" stroke-width="3"/>
<path d="M-24-1L-18-47L18-47L26-1Z" fill="url(#wood)" stroke="{light}" stroke-width="2"/>
<circle cx="1" cy="-65" r="29" fill="url(#bone)" stroke="{dark}" stroke-width="4"/><circle cx="1" cy="-65" r="24" fill="{dark}" stroke="{light}" stroke-width="2"/>
<path d="M1-86L1-80M1-50L1-44M-20-65L-14-65M16-65L22-65M-14-80L-9-75M12-54L17-49M-14-50L-9-55M12-76L17-81" stroke="{edge}" stroke-width="2"/>
<circle cx="1" cy="-65" r="4" fill="{accent}" stroke="{edge}" stroke-width="1.5"/>
<path d="M-9-40L-9-7L9-7L11-40" fill="{dark}" stroke="{base}" stroke-width="2"/><ellipse cx="1" cy="-18" rx="7" ry="10" fill="url(#core)"/>
<path d="M-22-89L-7-103L9-103L23-88M-28 2L30 2" fill="none" stroke="{edge}" stroke-width="2"/>
''',
    'lens': '''
<ellipse cx="0" cy="-51" rx="47" ry="25" transform="rotate(-29 0 -51)" fill="none" stroke="{dark}" stroke-width="10"/>
<ellipse cx="0" cy="-51" rx="47" ry="25" transform="rotate(-29 0 -51)" fill="none" stroke="url(#metal)" stroke-width="6"/>
<circle cx="0" cy="-51" r="34" fill="url(#void)" stroke="{light}" stroke-width="3"/><circle cx="0" cy="-51" r="25" fill="url(#core)" stroke="{dark}" stroke-width="3"/>
<path d="M-22-51Q-5-76 20-54Q5-27-22-51Z" fill="{dark}"/><path d="M-15-51Q0-65 15-51Q0-38-15-51Z" fill="{accent}"/><path d="M0-62L5-51L0-40L-5-51Z" fill="{edge}"/>
<path d="M-36-84L-23-78M34-86L25-77M-41-26L-29-31M41-25L28-31M0-96L0-86M0-16L0-6" stroke="{edge}" stroke-width="3"/>
<path d="M-44-58L-54-67L-48-81L-35-73ZM38-26L45-12L56-20L49-34ZM-6-103L0-113L7-104L1-96Z" fill="url(#body)" stroke="{dark}" stroke-width="2"/>
<path d="M-43-42Q0-2 44-59" fill="none" stroke="{dark}" stroke-width="10"/><path d="M-43-42Q0-2 44-59" fill="none" stroke="url(#metal)" stroke-width="6"/>
''',
    'prism': '''
<ellipse cx="0" cy="3" rx="33" ry="9" fill="{dark}"/>
<path d="M-27-38L-22-81L1-111L27-81L29-39L1-10Z" fill="url(#body)" stroke="{dark}" stroke-width="3"/>
<path d="M1-107L1-63L-22-79Z M1-63L25-79L1-107Z" fill="{edge}"/><path d="M1-63L-24-40L1-14Z" fill="{base}"/><path d="M1-63L25-40L1-14Z" fill="{accent}"/>
<path d="M-21-78L-24-42L1-63ZM25-78L26-42L1-63Z" fill="{light}"/><path d="M1-102L1-20M-18-77L-20-46M21-77L23-47" stroke="{edge}" stroke-width="1.8"/>
<path d="M-35-35L-25-27L-5-12L-4-2L-30-20Z M35-35L25-27L5-12L4-2L30-20Z" fill="url(#metal)" stroke="{dark}" stroke-width="2.5"/>
<path d="M-26-20L-6-5M26-20L6-5" stroke="{edge}" stroke-width="2"/><path d="M-4-65L1-75L6-65L1-54Z" fill="{edge}"/>
''',
    'portal': '''
<path d="M-48 4L-48-59Q-46-109 0-113Q48-107 49-58L49 4L30 7L28-58Q27-88 0-91Q-27-88-28-58L-29 6Z" fill="url(#metal)" stroke="{dark}" stroke-width="4"/>
<path d="M-25 1L-26-57Q-24-86 0-88Q26-86 27-56L26 1Z" fill="url(#void)"/>
<path d="M-18-5C-34-30-20-62 2-73C29-85 24-47 6-43C-12-37-15-19 5-20Q21-24 18-37" fill="none" stroke="{accent}" stroke-width="5"/>
<path d="M-14-9Q-25-24-15-42M4-69Q20-74 19-59M-5-28Q4-36 12-30" stroke="{edge}" stroke-width="1.8" fill="none"/>
<path d="M-41-23L-31-23M-42-47L-31-49M-38-72L-28-68M-24-95L-19-84M0-105L0-94M24-95L19-84M38-72L28-68M42-47L31-49M41-23L31-23" stroke="{edge}" stroke-width="3"/>
<path d="M-53 1L-27-2L-25 9L-53 10Z M29-2L54 1L54 10L27 9Z" fill="url(#metal)" stroke="{dark}" stroke-width="2.5"/>
<path d="M-41-89L-29-101L-23-92L-34-81Z M32-99L44-87L35-81L25-93Z" fill="{base}" stroke="{light}" stroke-width="1.5"/>
''',
    'rift': '''
<path d="M7-112Q-31-101-38-70Q-50-33-5 8L19-7Q-12-43 4-72Q17-94 7-112Z" fill="{dark}" stroke="{base}" stroke-width="3"/>
<path d="M7-108Q-18-77-19-57Q-22-25 14-8L5-19Q-14-44 2-75Q14-97 7-108Z" fill="url(#core)" stroke="{light}" stroke-width="1.5"/>
<path d="M-25-86L-45-99L-35-73M-36-60L-56-67L-46-45M-28-34L-49-26L-30-17M-12-8L-16 11L-2 5" fill="url(#body)" stroke="{dark}" stroke-width="2"/>
<path d="M-12-95L-26-73L-24-65M-25-48L-20-35L-6-19" fill="none" stroke="{edge}" stroke-width="2"/>
<path d="M18-90L27-97L30-85L22-76Z M22-41L34-38L27-25L19-29Z" fill="{light}" stroke="{dark}" stroke-width="1.5"/>
''',
    'comet': '''
<path d="M-20-55L-40-103L-17-85L-8-114L5-83L21-111L25-76L47-93L37-51Z" fill="url(#spirit)" stroke="{dark}" stroke-width="2"/>
<path d="M-13-60L-24-90L-9-75L1-99L12-67L26-86L29-58Z" fill="{edge}"/>
<path d="M-34-38L-19-64L13-68L38-43L30-15L5 0L-24-12Z" fill="url(#metal)" stroke="{dark}" stroke-width="3"/>
<path d="M-18-61L-5-42L-31-36M-5-42L15-63L33-43L5-29L4-4M-5-42L5-29L-23-14" fill="none" stroke="{accent}" stroke-width="5"/>
<path d="M-17-60L-5-42L5-29M15-61L31-44L6-30" fill="none" stroke="{edge}" stroke-width="1.5"/>
<path d="M-24-25L-13-21L-14-13M14-12L26-22L29-35" fill="none" stroke="{light}" stroke-width="2"/>
''',
    'blade': '''
<path d="M-54-43L-30-72L40-96L31-66L8-50L36-33L49-7L-28-18Z" fill="url(#metal)" stroke="{dark}" stroke-width="3.5"/>
<path d="M-49-44L-26-65L33-91L13-66L-7-53Z" fill="{edge}"/><path d="M-48-39L-26-23L40-12L16-32L-6-37Z" fill="{light}"/>
<path d="M-24-60L-16-55M-15-64L-7-58M7-73L13-68M-22-26L-15-33M-10-24L-3-31M8-21L13-26" stroke="{base}" stroke-width="2"/>
<path d="M-16-64L-7-22L2-24L-7-67Z" fill="{base}" stroke="{dark}" stroke-width="2"/>
<path d="M-18-44L-9-53L0-43L-7-33Z" fill="url(#core)" stroke="{edge}" stroke-width="2"/>
<path d="M-40-48L-32-52M17-76L27-81M17-20L30-17" stroke="{edge}" stroke-width="1.4"/>
''',
}

# Gradients have no filters or embedded raster layers. Each prop remains a
# single cached image; the renderer supplies bounded motion and semantic ink.
MATERIAL_DEFS = '''
<linearGradient id="wood" x1="0" y1="0" x2=".85" y2="1"><stop stop-color="#b59a64"/><stop offset=".42" stop-color="#716044"/><stop offset="1" stop-color="{dark}"/></linearGradient>
<linearGradient id="leaf" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="{edge}"/><stop offset=".35" stop-color="{light}"/><stop offset="1" stop-color="{base}"/></linearGradient>
<linearGradient id="metal" x1="0" y1="0" x2=".85" y2="1"><stop stop-color="#ece2c5"/><stop offset=".28" stop-color="#a5a49b"/><stop offset=".52" stop-color="#5c626b"/><stop offset=".72" stop-color="#929193"/><stop offset="1" stop-color="{dark}"/></linearGradient>
<linearGradient id="bone" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="#fff1ce"/><stop offset=".38" stop-color="#d2c7ad"/><stop offset=".76" stop-color="#a89b8d"/><stop offset="1" stop-color="{base}"/></linearGradient>
<radialGradient id="core"><stop stop-color="{edge}"/><stop offset=".3" stop-color="{light}"/><stop offset=".65" stop-color="{accent}"/><stop offset="1" stop-color="{dark}"/></radialGradient>
<radialGradient id="void"><stop stop-color="{accent}"/><stop offset=".42" stop-color="{base}"/><stop offset="1" stop-color="#111621"/></radialGradient>
<linearGradient id="spirit" x1="0" y1="0" x2=".35" y2="1"><stop stop-color="{edge}"/><stop offset=".32" stop-color="{light}"/><stop offset=".68" stop-color="{accent}"/><stop offset="1" stop-color="{base}" stop-opacity=".12"/></linearGradient>
'''

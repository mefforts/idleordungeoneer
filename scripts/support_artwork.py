"""Authored support structures and elite instruments; ground anchor (0, 0).

Three silhouettes share each support role. Materials change construction as well
as color: living timber, riveted iron, carved bone and suspended crystal.
"""
from effect_artwork import MATERIAL_DEFS

PALETTES = [
    ('#68573c', '#b6bd7a', '#f2dfaa', '#26362e', '#85a961'),
    ('#645047', '#bf9f70', '#fff0bf', '#302c34', '#f4a25f'),
    ('#8a7e88', '#d9cdb6', '#fff5da', '#302e43', '#b7a1d8'),
    ('#526c91', '#b3d5e8', '#f1ffff', '#272e4b', '#8cc8e8'),
]
SUPPORT_ROLES = {
    'mend': ('#68df92', '#edffdf', '#1b4a39'),
    'fury': ('#f17c70', '#fff0d1', '#652f3b'),
}
SUPPORT_VARIANTS = [
    {'name': 'shrine', 'coreY': -62},
    {'name': 'lantern', 'coreY': -62},
    {'name': 'altar', 'coreY': -54},
]

BASES = [
    '''<path d="M-41 3Q-40-8-25-15L-17-30L15-31L27-14L43 3L24 7L4 1L-15 8Z" fill="url(#wood)" stroke="{dark}" stroke-width="3"/>
<path d="M-31 2L-17-9L-12-25M-3-1L1-26M30 3L17-12L14-26" fill="none" stroke="{light}" stroke-width="2.4"/>
<path d="M-28-8Q-48-24-48-9Q-41-1-28-8M24-10Q39-29 45-17Q41-6 24-10" fill="url(#leaf)" stroke="{dark}" stroke-width="2"/>
<path d="M-42-10L-30-8M29-12L41-19M-12 3L-4 0" stroke="{edge}" stroke-width="1.3"/>''',
    '''<path d="M-40 4L-40-6L-30-14L-26-28L27-28L31-14L41-6L41 4Z" fill="url(#metal)" stroke="{dark}" stroke-width="3"/>
<path d="M-32-7L31-7M-25-23L25-23M-37 1L37 1" stroke="{edge}" stroke-width="1.6"/>
<path d="M-24-26L-29-6M24-26L29-6" stroke="{base}" stroke-width="6"/>
<g fill="{edge}" stroke="{dark}" stroke-width="1.3"><circle cx="-32" cy="-3" r="2.7"/><circle cx="32" cy="-3" r="2.7"/><circle cx="-23" cy="-20" r="2.2"/><circle cx="23" cy="-20" r="2.2"/></g>''',
    '''<path d="M-39 4L-36-9L-24-14L-19-30L19-30L24-14L36-9L40 4Z" fill="url(#bone)" stroke="{dark}" stroke-width="3"/>
<path d="M-29-7Q0 2 30-7M-17-25L17-25M-14-19L14-19" fill="none" stroke="{base}" stroke-width="2.2"/>
<path d="M-26-10L-20 1M-13-8L-10 3M0-7L0 4M13-8L10 3M26-10L20 1" stroke="{dark}" stroke-width="2"/>
<path d="M-32-3L-29-1M24-10L31-7M-14-27L-9-27" stroke="{edge}" stroke-width="1.5"/>''',
    '''<path d="M-43 3L-27-15L-19-31L19-31L28-15L44 3L22 8L0 2L-22 8Z" fill="url(#body)" stroke="{dark}" stroke-width="3"/>
<path d="M0-28L0-6L-36 2L-23-12ZM0-6L23-12L36 2L0 0Z" fill="{edge}"/>
<path d="M-17-28L-10-16L0-6L10-16L17-28" fill="none" stroke="{light}" stroke-width="2"/>
<path d="M-30-4L-21-7M21-7L30-4" stroke="{accent}" stroke-width="2"/>''',
]

# Each frame is deliberately a different construction, rather than a tint swap.
FRAMES = [
    [
        '''<path d="M-21-15Q-38-40-29-73L-35-87L-23-83L-15-98L-10-83Q0-90 12-82L22-96L24-80L37-85L29-70Q39-37 21-15L12-23L17-47L14-75L-14-75L-17-48L-11-22Z" fill="url(#wood)" stroke="{dark}" stroke-width="3"/><path d="M-23-25Q-30-49-23-71M23-25Q30-47 23-68M-18-83L-12-80" fill="none" stroke="{light}" stroke-width="2.2"/><path d="M-28-57Q-49-74-47-52Q-39-45-28-57M27-55Q48-77 49-57Q42-47 27-55" fill="url(#leaf)" stroke="{dark}" stroke-width="2"/>''',
        '''<path d="M-30-17L-32-72L-22-88L-10-96L14-96L27-84L32-71L29-17L17-23L18-69L11-80L-12-80L-19-68L-18-22Z" fill="url(#metal)" stroke="{dark}" stroke-width="3"/><path d="M-28-68L-28-26M27-67L27-26M-9-90L11-90" stroke="{edge}" stroke-width="2"/><path d="M-35-53L-20-53M20-53L36-53M-35-37L-20-37M20-37L36-37" stroke="{base}" stroke-width="5"/><g fill="{edge}"><circle cx="-25" cy="-77" r="2.5"/><circle cx="25" cy="-77" r="2.5"/><circle cx="-25" cy="-22" r="2.5"/><circle cx="25" cy="-22" r="2.5"/></g>''',
        '''<path d="M-28-17L-31-71L-24-86L-13-93L14-93L25-85L32-70L28-17L17-23L19-69L11-79L-11-79L-19-67L-17-23Z" fill="url(#bone)" stroke="{dark}" stroke-width="3"/><path d="M-28-62L-17-57M-28-48L-17-44M-26-34L-16-32M27-62L17-57M27-48L17-44M25-34L16-32" stroke="{base}" stroke-width="3"/><path d="M-14-96Q0-107 15-96L14-85L6-79L-6-79L-15-86Z" fill="url(#bone)" stroke="{dark}" stroke-width="2"/><path d="M-10-92L-3-89L-8-85M4-89L11-92L8-85M-2-83L2-83" stroke="{dark}" stroke-width="2"/>''',
        '''<path d="M-29-18L-35-63L-24-85L0-103L25-84L35-63L29-18L17-23L22-62L14-77L0-88L-14-77L-22-62L-17-23Z" fill="url(#body)" stroke="{dark}" stroke-width="3"/><path d="M0-98L0-88L-16-75L-26-61L-23-26L-30-64L-21-81Z" fill="{edge}"/><path d="M3-96L22-81L30-63L24-27L24-62L16-78Z" fill="{accent}"/><path d="M-39-55L-47-68L-43-80L-33-66M37-54L46-68L42-79L33-66" fill="{light}" stroke="{dark}" stroke-width="2"/>''',
    ],
    [
        '''<path d="M-7-15L-10-83Q-28-89-32-72L-30-61L-38-65Q-44-93-12-99Q3-102 10-85L8-16Z" fill="url(#wood)" stroke="{dark}" stroke-width="3"/><path d="M-5-22L-5-81Q-23-99-34-80" fill="none" stroke="{light}" stroke-width="2.3"/><path d="M-7-89Q11-112 24-97Q12-82-7-89M-20-93Q-42-106-42-89Q-32-81-20-93" fill="url(#leaf)" stroke="{dark}" stroke-width="2"/>''',
        '''<path d="M-6-17L-8-91L4-101L22-101L36-87L36-66L28-66L28-84L18-92L1-92L1-17Z" fill="url(#metal)" stroke="{dark}" stroke-width="3"/><path d="M-3-86L-2-25M7-96L19-96L32-85L32-72" fill="none" stroke="{edge}" stroke-width="2"/><path d="M-10-32L5-32M-10-42L5-42" stroke="{base}" stroke-width="5"/><circle cx="16" cy="-96" r="2" fill="{dark}"/>''',
        '''<path d="M-8-16L-10-85Q-7-105 14-101Q35-96 32-72L24-67L25-82Q23-95 11-93Q0-93 1-80L3-17Z" fill="url(#bone)" stroke="{dark}" stroke-width="3"/><path d="M-8-34L3-34M-8-47L3-47M-8-61L3-61M-6-76L3-76" stroke="{base}" stroke-width="3"/><path d="M7-98L18-98M27-88L29-78" stroke="{edge}" stroke-width="1.7"/>''',
        '''<path d="M-8-17L-14-73L-5-96L6-102L18-95L26-76L17-65L6-75L11-87L4-92L-4-75L1-18Z" fill="url(#body)" stroke="{dark}" stroke-width="3"/><path d="M3-98L-8-74L-3-26L-10-73L-3-94Z" fill="{edge}"/><path d="M7-92L18-77L14-71L21-78L16-91Z" fill="{light}"/><path d="M-26-59L-34-70L-29-81L-21-69" fill="{accent}" stroke="{dark}" stroke-width="2"/>''',
    ],
    [
        '''<path d="M-18-17Q-28-36-31-49L-43-60L-38-68L-20-54L-11-32L9-32L22-54L40-68L45-60L32-48L18-17Z" fill="url(#wood)" stroke="{dark}" stroke-width="3"/><path d="M-14-24L-26-50M13-24L27-49" stroke="{light}" stroke-width="2"/><path d="M-30-52Q-48-76-53-56Q-47-41-30-52M29-52Q49-77 53-57Q48-41 29-52" fill="url(#leaf)" stroke="{dark}" stroke-width="2"/>''',
        '''<path d="M-17-17L-29-36L-38-47L-43-65L-32-68L-26-49L-11-31L11-31L26-49L33-68L44-64L38-47L29-36L18-17Z" fill="url(#metal)" stroke="{dark}" stroke-width="3"/><path d="M-36-62L-31-46L-16-28M36-62L31-46L16-28" fill="none" stroke="{edge}" stroke-width="2"/><path d="M-25-38L-18-44M25-38L18-44" stroke="{base}" stroke-width="5"/>''',
        '''<path d="M-16-17Q-34-30-41-51L-43-68L-33-72L-31-54L-10-32L9-32L30-54L33-73L43-68L41-51Q32-31 16-17Z" fill="url(#bone)" stroke="{dark}" stroke-width="3"/><path d="M-37-57L-29-59M-31-43L-23-48M-23-33L-17-39M37-57L29-59M31-43L23-48M23-33L17-39" stroke="{base}" stroke-width="3"/>''',
        '''<path d="M-17-17L-35-38L-42-62L-35-78L-24-59L-22-43L-9-30L9-30L23-43L25-59L35-78L44-62L36-38L17-17Z" fill="url(#body)" stroke="{dark}" stroke-width="3"/><path d="M-35-72L-30-42L-13-25L-25-44L-29-61ZM35-72L29-61L25-44L13-25L30-42Z" fill="{edge}"/><path d="M-44-41L-51-49L-48-59L-39-50M43-41L51-50L48-61L39-50" fill="{accent}" stroke="{dark}" stroke-width="2"/>''',
    ],
]

def symbol(role, y, scale=1):
    if role == 'mend':
        shape = '<path d="M-3-11H3V-3H11V3H3V11H-3V3H-11V-3H-3Z" fill="{roleLight}" stroke="{roleDark}" stroke-width="1.5"/><path d="M-14 9L-19 4L-18 13L-10 15M14 9L19 4L18 13L10 15" fill="none" stroke="{roleLight}" stroke-width="1.6"/>'
    else:
        shape = '<path d="M-1-16L6-12L3 3L-3 8L-6 3Z" fill="{roleLight}" stroke="{roleDark}" stroke-width="1.5"/><path d="M-11 4L8 8M-4 6L-7 16M-11 14L-3 17" stroke="{roleLight}" stroke-width="3"/><path d="M-14-3L-19-10M12 1L19-3" stroke="{roleLight}" stroke-width="1.7"/>'
    return f'<g transform="translate(0 {y}) scale({scale})">'+shape+'</g>'

def support_structure(role, kind, variant):
    y = SUPPORT_VARIANTS[variant]['coreY']
    frame = FRAMES[variant][kind]
    if variant == 0:
        core = f'<path d="M0-84L18-70L18-51L0-36L-18-51L-18-70Z" fill="{{roleDark}}" stroke="{{light}}" stroke-width="2.4"/><ellipse cy="{y}" rx="15" ry="18" fill="url(#role)"/>'
    elif variant == 1:
        core = '<path d="M-24-79L0-89L25-79L28-50L14-37L-15-37L-28-50Z" fill="url(#body)" stroke="{dark}" stroke-width="3"/><path d="M-19-73L0-80L20-72L19-51L10-44L-11-44L-20-52Z" fill="url(#role)" stroke="{edge}" stroke-width="1.7"/><path d="M-24-77L0-84L24-77M-22-48L20-48" fill="none" stroke="{light}" stroke-width="2"/><path d="M0-91L0-98M-9-35L10-35" stroke="{edge}" stroke-width="3"/>'
    else:
        core = '<path d="M-26-44Q0-31 26-44L18-26Q0-17-19-26Z" fill="url(#metal)" stroke="{dark}" stroke-width="3"/><ellipse cy="-44" rx="26" ry="8" fill="{roleDark}" stroke="{edge}" stroke-width="2"/><path d="M0-83L17-65L14-48L0-36L-15-49L-17-65Z" fill="url(#role)" stroke="{roleLight}" stroke-width="2"/><path d="M0-80L0-40L-11-51L-12-64Z" fill="{roleLight}" opacity=".27"/>'
    role_crown = ('<path d="M-13-91Q0-111 13-91L0-96Z" fill="url(#leaf)" stroke="{dark}" stroke-width="2"/>' if role == 'mend' else '<path d="M-13-93L-18-106L-5-99L0-108L6-98L17-106L13-92Z" fill="url(#metal)" stroke="{dark}" stroke-width="2"/>') if variant == 0 else ''
    return BASES[kind] + frame + core + symbol(role, y, .82) + role_crown

TASKS = {
    'ascend': '''<path d="M-28-43L-23-62L-15-75L15-75L24-61L29-43L18-28L-19-28Z" fill="url(#metal)" stroke="{dark}" stroke-width="3"/><path d="M-26-45Q0-29 27-45L18-29Q0-20-18-29Z" fill="{base}" stroke="{dark}" stroke-width="2"/><path d="M-18-47C-29-64-4-74-10-91Q2-84 4-104Q23-89 13-72Q32-73 20-49Z" fill="url(#taskFire)" stroke="#bd9052" stroke-width="1.5"/><path d="M-7-48Q-14-66 2-79Q1-65 11-60L8-47Z" fill="#fff7c9"/><path d="M-27-78L-39-87L-34-68M27-78L40-88L34-68" fill="{light}" stroke="{dark}" stroke-width="2"/>''',
    'empower': '''<path d="M-24-30L-29-67L-21-87L-10-96L11-96L25-84L30-64L24-30L13-35L17-65L11-81L-10-81L-18-66L-12-35Z" fill="url(#body)" stroke="{dark}" stroke-width="3"/><path d="M-23-59L-23-75L-15-87M23-59L23-75L15-87" fill="none" stroke="{edge}" stroke-width="2"/><ellipse cy="-48" rx="17" ry="6" fill="#322b42" stroke="#f6dda3" stroke-width="1.5"/><path d="M-16-54L-20-74L-9-67L0-80L10-67L20-74L16-54Z" fill="url(#taskGold)" stroke="{dark}" stroke-width="2.4"/><path d="M-14-56L14-56M-10-61L10-61" stroke="#fff2c6" stroke-width="1.5"/><path d="M0-69L5-64L0-59L-5-64Z" fill="{accent}" stroke="#fff5cd" stroke-width="1"/>''',
    'conduit': '''<path d="M-28-27L-34-60L-27-87L-8-103L11-103L29-87L35-60L28-27L17-32L23-61L17-80L5-91L-4-91L-17-80L-23-60L-16-32Z" fill="url(#body)" stroke="{dark}" stroke-width="3"/><path d="M-26-44L-28-62L-21-83L-6-97M26-45L29-62L22-83L9-97" fill="none" stroke="{edge}" stroke-width="2"/><ellipse cy="-64" rx="19" ry="30" fill="url(#taskVoid)" stroke="#e6c0fb" stroke-width="1.8"/><path d="M-12-70Q1-92 12-72Q24-54-1-45Q-20-45-9-62Q0-75 8-60Q12-53 1-52" fill="none" stroke="#e4c5fa" stroke-width="2"/><path d="M-30-65L-42-76L-42-59L-31-51M31-65L43-77L43-59L32-51" fill="{accent}" stroke="{dark}" stroke-width="2"/>''',
    'siege': '''<path d="M-22-23L-15-63L15-63L23-23L10-28L7-46L-7-46L-10-28Z" fill="url(#metal)" stroke="{dark}" stroke-width="3"/><path d="M-31-63L-31-79L-20-90L20-90L32-79L32-63L19-53L-20-53Z" fill="url(#body)" stroke="{dark}" stroke-width="3"/><path d="M-24-78L-18-83L18-83L25-77L18-62L-18-62Z" fill="{dark}" stroke="{light}" stroke-width="2"/><path d="M-17-72L0-95L18-72L0-49Z" fill="url(#taskGold)" stroke="#fff0bb" stroke-width="2"/><path d="M0-89L0-55L-11-72Z" fill="#fff4c8"/><path d="M-37-55L-45-77L-40-88L-29-68M36-55L46-78L40-89L29-68" fill="url(#metal)" stroke="{dark}" stroke-width="2.5"/><path d="M-17-34L-10-47M17-34L10-47" stroke="{edge}" stroke-width="2"/>''',
}

TRIMS = [
    '<path d="M-26-18Q-44-38-31-52M27-18Q43-38 32-52" fill="none" stroke="{base}" stroke-width="5"/><path d="M-33-38Q-51-52-49-35Q-43-27-33-38M33-38Q51-54 50-36Q44-27 33-38" fill="url(#leaf)" stroke="{dark}" stroke-width="1.8"/>',
    '<g fill="{edge}" stroke="{dark}" stroke-width="1.4"><circle cx="-24" cy="-31" r="3"/><circle cx="24" cy="-31" r="3"/><circle cx="-25" cy="-66" r="2.6"/><circle cx="25" cy="-66" r="2.6"/></g><path d="M-31-21L-19-16M31-21L19-16" stroke="{base}" stroke-width="5"/>',
    '<path d="M-24-25L-36-43L-34-58M24-25L36-43L34-58" fill="none" stroke="{dark}" stroke-width="8"/><path d="M-24-25L-36-43L-34-58M24-25L36-43L34-58" fill="none" stroke="url(#bone)" stroke-width="4.5"/><path d="M-34-41L-29-45M34-41L29-45" stroke="{base}" stroke-width="2"/>',
    '<path d="M-40-27L-48-39L-43-54L-33-40ZM39-27L49-40L43-54L33-40Z" fill="{light}" stroke="{dark}" stroke-width="2"/><path d="M-43-49L-42-30M43-49L42-30" stroke="{edge}" stroke-width="1.4"/>',
]

EXTRA_DEFS = '''<radialGradient id="role"><stop stop-color="{roleLight}"/><stop offset=".3" stop-color="{roleColor}"/><stop offset="1" stop-color="{roleDark}"/></radialGradient>
<linearGradient id="taskGold" x2=".5" y2="1"><stop stop-color="#fff3c6"/><stop offset=".4" stop-color="#dfb961"/><stop offset="1" stop-color="#876039"/></linearGradient>
<linearGradient id="taskFire" x2=".3" y2="1"><stop stop-color="#fff3c5"/><stop offset=".45" stop-color="#f5d27e"/><stop offset="1" stop-color="#a87442"/></linearGradient>
<radialGradient id="taskVoid"><stop stop-color="#efe6ff"/><stop offset=".35" stop-color="#bd91de"/><stop offset=".65" stop-color="#65517f"/><stop offset="1" stop-color="#292739"/></radialGradient>'''

def illustration(family, kind, variant=0):
    base, light, edge, dark, accent = PALETTES[kind]
    role = SUPPORT_ROLES.get(family, ('#e3be70', '#fff1c4', '#514136'))
    values = dict(base=base, light=light, edge=edge, dark=dark, accent=accent,
                  roleColor=role[0], roleLight=role[1], roleDark=role[2])
    defs = '<linearGradient id="body" x2=".8" y2="1"><stop stop-color="{light}"/><stop offset=".5" stop-color="{base}"/><stop offset="1" stop-color="{dark}"/></linearGradient>' + MATERIAL_DEFS + EXTRA_DEFS
    shape = support_structure(family, kind, variant) if family in SUPPORT_ROLES else BASES[kind] + TASKS[family] + TRIMS[kind]
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-56 -112 112 124"><defs>' + defs.format(**values) + '</defs>' + shape.format(**values) + '</svg>'

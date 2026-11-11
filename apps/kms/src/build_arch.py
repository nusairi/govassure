"""Build-time generator for the Architect's pack (provider modules such as arch_aws.py).
Resolves citation tokens to S-codes, validates every policy (JSON round-trip, actions and
condition keys against the AWS Service Authorization Reference and the IAM global keys page),
and writes <out>/kms-arch-<provider>.js and <out>/<provider>-kms-adr-pack.md."""
import json, os, re, fnmatch
SRC = os.path.dirname(os.path.abspath(__file__))
RES = os.path.join(SRC, '..', 'research-arch')

class Cites:
    def __init__(self, srcs):
        self.srcs = srcs; self.codes = {c for c, t, u in srcs}; self.used = set()
        self.by = {}
        for c, t, u in srcs:
            tail = u.rstrip('/').split('/')[-1].split('#')[0]
            for k in {tail, re.sub(r'\.html$', '', tail)}: self.by.setdefault(k, []).append(c)
    def __call__(self, s):
        out = []
        for tok in s.split():
            if re.fullmatch(r'S\d+', tok): assert tok in self.codes, 'unknown code ' + tok; c = tok
            else:
                m = self.by.get(tok) or self.by.get(tok + '.html')
                assert m and len(set(m)) == 1, 'unresolved/ambiguous source slug: %r -> %r' % (tok, m); c = m[0]
            if c not in out: out.append(c)
        self.used.update(out); return out

def _load_sar():
    sar = json.load(open(os.path.join(RES, 'sar', 'sar.json')))
    g = open(os.path.join(RES, 'docs_aws_amazon_com_iam_latest_userguide_reference_policies_condition_keys_html.txt')).read()
    g += open(os.path.join(RES, 'docs_aws_amazon_com_kms_latest_developerguide_conditions_aws_html.txt')).read()
    gkeys = set(re.findall(r'aws:[A-Za-z]+', g))
    return sar, gkeys

OPS = {'StringEquals', 'StringNotEquals', 'StringLike', 'StringNotLike', 'StringNotEqualsIfExists', 'StringEqualsIfExists',
       'ArnEquals', 'ArnNotEquals', 'ArnLike', 'ArnNotLike', 'Bool', 'Null', 'NumericLessThan', 'NumericGreaterThan',
       'ForAllValues:StringEquals', 'ForAnyValue:StringEquals'}

def check_policy(doc, sar, gkeys, where):
    assert json.loads(json.dumps(doc)) == doc
    assert doc.get('Version') == '2012-10-17', where
    for st in doc['Statement']:
        assert st['Effect'] in ('Allow', 'Deny'), where
        acts = st['Action'] if isinstance(st['Action'], list) else [st['Action']]
        for a in acts:
            svc, name = a.split(':', 1)
            assert svc in sar, where + ' unknown service ' + a
            if name != '*': assert fnmatch.filter(sar[svc]['actions'], name), where + ' unknown action ' + a
        for op, kv in st.get('Condition', {}).items():
            assert op in OPS, where + ' operator ' + op
            for k in kv:
                if k.startswith('aws:'): assert k in gkeys, where + ' unknown global key ' + k
                elif k.startswith('kms:EncryptionContext:'): assert 'kms:EncryptionContext:' in sar['kms']['ckeys']
                else:
                    svc = k.split(':')[0]; assert k in sar[svc]['ckeys'], where + ' unknown condition key ' + k

def check_pattern(p, sar, where):
    assert json.loads(json.dumps(p)) == p
    d = p.get('detail', {})
    for n in d.get('eventName', []):
        svc = d['eventSource'][0].split('.')[0]; assert n in sar[svc]['actions'], where + ' unknown event ' + n

def build(mod, provider, srcs, out):
    C = Cites(srcs); sar, gkeys = _load_sar()
    D = {'provider': provider, 'checked': '4 November 2026', 'intro': mod.INTRO, 'intro_c': C(mod.INTRO_C),
         'md': '%s-kms-adr-pack.md' % provider}
    D['diagrams'] = [dict(d, c=C(d['c'])) for d in mod.DIAGRAMS]
    for d in D['diagrams']:
        W, H = d['vb']
        for n in d['groups'] + d['nodes']: assert n['x'] >= 0 and n['y'] >= 0 and n['x'] + n['w'] <= W and n['y'] + n['h'] <= H, (d['id'], n)
        for e in d['edges']:
            for x, y in e['p']: assert 0 <= x <= W and 0 <= y <= H, (d['id'], e)
    D['adr_template'] = mod.ADR_TEMPLATE
    D['adrs'] = [dict(a, ctx_c=C(a['ctx_c']), cons_c=C(a['cons_c']), map_c=C(a['map_c'])) for a in mod.ADRS]
    pols = []
    for p in mod.POLICIES:
        check_policy(p['doc'], sar, gkeys, p['id'])
        q = {'id': p['id'], 't': p['t'], 'kind': p['kind'], 'why': p['why'], 'c': C(p['c']), 'json': json.dumps(p['doc'], indent=2)}
        if 'doc2' in p:
            check_policy(p['doc2'], sar, gkeys, p['id'] + 'b'); q['json2_t'] = p['doc2_t']; q['json2'] = json.dumps(p['doc2'], indent=2)
        pols.append(q)
    D['policies'] = pols
    D['hierarchy'] = [[a, b, C(c)] for a, b, c in mod.HIERARCHY]
    D['alias_rules'] = [[a, b, C(c)] for a, b, c in mod.ALIAS_RULES]
    D['tags'] = mod.TAGS; D['tag_rules'] = mod.TAG_RULES; D['tag_rules_c'] = C(mod.TAG_RULES_C); D['ownership'] = mod.OWNERSHIP
    D['threats'] = [[t, i, p, d, m, C(c)] for t, i, p, d, m, c in mod.THREATS]
    cfgtxt = ' '.join(u for c, t, u in srcs)
    for n, d, c in mod.CONFIG_RULES: assert '/' + n + '.html' in cfgtxt, 'Config rule without its own doc page: ' + n
    D['config'] = [[n, d, C(c)] for n, d, c in mod.CONFIG_RULES]
    eb = []
    for e in mod.EB_PATTERNS:
        check_pattern(e['doc'], sar, e['id']); eb.append({'id': e['id'], 't': e['t'], 'why': e['why'], 'c': C(e['c']), 'json': json.dumps(e['doc'], indent=2)})
    D['eb'] = eb
    D['alarms'] = [[a, b, C(c)] for a, b, c in mod.ALARMS]
    D['runbooks'] = [dict(r, c=C(r['c'])) for r in mod.RUNBOOKS]
    D['checklist'] = [[a, b, c, d, C(e)] for a, b, c, d, e in mod.CHECKLIST]
    D['cost'] = [[a, b, C(c)] for a, b, c in mod.COST]
    D['limits'] = [[a, b, C(c)] for a, b, c in mod.LIMITS]
    # every source added for the pack (S96 onwards) must be cited somewhere in it
    new = {c for c, t, u in srcs if int(c[1:]) >= 96}
    assert new <= C.used, 'uncited pack sources: %s' % sorted(new - C.used, key=lambda x: int(x[1:]))
    js = ('/* generated by src/build_arch.py from src/arch_%s.py - do not edit */\n'
          'window.KMS_ARCH=window.KMS_ARCH||{};\nwindow.KMS_ARCH.%s=%s;\n') % (provider, provider, json.dumps(D, ensure_ascii=False, separators=(',', ':')))
    open(os.path.join(out, 'kms-arch-%s.js' % provider), 'w').write(js)
    open(os.path.join(out, D['md']), 'w').write(markdown(mod, D, srcs))
    return D

def markdown(mod, D, srcs):
    title = {c: (t, u) for c, t, u in srcs}
    used = []
    def ref(codes):
        for c in codes:
            if c not in used: used.append(c)
        return ' [' + ', '.join(codes) + ']' if codes else ''
    L = ['# AWS KMS architecture decision records', '',
         'Architect\'s pack: AWS KMS, from the Key Management Lifecycle app (kms.govassured.com). Facts checked against AWS and NCSC pages on %s; check current documentation before relying on them. Codes in square brackets refer to the Sources list at the end.' % D['checked'], '',
         '## ADR template', '', '| Field | What to record |', '|---|---|']
    L += ['| %s | %s |' % (a.replace('|', '\\|'), b.replace('|', '\\|')) for a, b in D['adr_template']]
    for a in D['adrs']:
        L += ['', '## %s: %s' % (a['id'], a['t']), '', '- **Status:** Proposed (adapt and accept locally)',
              '- **Decision owner:** service owner, with the security architect', '',
              '### Context', '', a['ctx'] + ref(a['ctx_c']), '', '### Decision', '', a['dec'], '', '### Consequences', '']
        L += ['- ' + x for x in a['cons']]
        L[-1] += ref(a['cons_c'])
        L += ['', '### Controls and guardrails', '', a['ctl'], '', '### Evidence', '', a['ev'], '', '### Mappings', '', a['map'] + ref(a['map_c'])]
    L += ['', '## Sources', '']
    L += ['- %s %s: %s' % (c, title[c][0], title[c][1]) for c in sorted(used, key=lambda x: int(x[1:]))]
    return '\n'.join(L) + '\n'

"""
Build the "How to edit and publish" PDF guide for non-technical editors.
Run: python3 scripts/build-editing-guide.py
Output: docs/editing-guide.pdf
"""
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    PageBreak,
    Table,
    TableStyle,
    KeepTogether,
    HRFlowable,
)
from reportlab.lib.enums import TA_LEFT
from pathlib import Path

# --- Brand palette (from globals.css) ---
BRAND = colors.HexColor("#2aa5ca")
BRAND_DARK = colors.HexColor("#2491af")
INK = colors.HexColor("#262626")
INK_BODY = colors.HexColor("#4c4c4c")
INK_MUTED = colors.HexColor("#6b6b6b")
CREAM = colors.HexColor("#fdfbf6")
CREAM_LINE = colors.HexColor("#ece2cb")
ACCENT = colors.HexColor("#e2333e")
SUCCESS = colors.HexColor("#1f7a93")

# --- Styles ---
base = getSampleStyleSheet()

TITLE = ParagraphStyle(
    "Title",
    parent=base["Title"],
    fontName="Helvetica-Bold",
    fontSize=26,
    leading=30,
    textColor=INK,
    alignment=TA_LEFT,
    spaceAfter=4,
)
EYEBROW = ParagraphStyle(
    "Eyebrow",
    parent=base["Normal"],
    fontName="Helvetica-Bold",
    fontSize=9,
    leading=12,
    textColor=BRAND,
    spaceAfter=4,
    letterSpacing=2,
)
SUBTITLE = ParagraphStyle(
    "Subtitle",
    parent=base["Normal"],
    fontName="Helvetica",
    fontSize=12,
    leading=16,
    textColor=INK_MUTED,
    spaceAfter=18,
)
H1 = ParagraphStyle(
    "H1",
    parent=base["Heading1"],
    fontName="Helvetica-Bold",
    fontSize=18,
    leading=22,
    textColor=INK,
    spaceBefore=18,
    spaceAfter=8,
)
H2 = ParagraphStyle(
    "H2",
    parent=base["Heading2"],
    fontName="Helvetica-Bold",
    fontSize=13,
    leading=17,
    textColor=BRAND_DARK,
    spaceBefore=14,
    spaceAfter=4,
)
BODY = ParagraphStyle(
    "Body",
    parent=base["Normal"],
    fontName="Helvetica",
    fontSize=10.5,
    leading=15,
    textColor=INK_BODY,
    spaceAfter=6,
)
STEP = ParagraphStyle(
    "Step",
    parent=BODY,
    leftIndent=18,
    bulletIndent=2,
    fontSize=10.5,
    leading=15,
    spaceAfter=4,
)
NOTE = ParagraphStyle(
    "Note",
    parent=base["Normal"],
    fontName="Helvetica-Oblique",
    fontSize=9.5,
    leading=13,
    textColor=INK_MUTED,
    spaceAfter=10,
)
MONO = ParagraphStyle(
    "Mono",
    parent=base["Code"],
    fontName="Courier-Bold",
    fontSize=10,
    leading=13,
    textColor=BRAND_DARK,
    spaceAfter=4,
)
FOOTER_TEXT = ParagraphStyle(
    "Footer",
    parent=base["Normal"],
    fontName="Helvetica",
    fontSize=8,
    leading=10,
    textColor=INK_MUTED,
)


def callout(label, body_html, bg=CREAM, border=CREAM_LINE, tone=BRAND):
    """A pill of highlighted info (e.g. URLs, tips)."""
    label_para = Paragraph(
        f"<font color='{tone.hexval()}'><b>{label}</b></font>",
        ParagraphStyle("CL", parent=BODY, fontSize=9, leading=11, spaceAfter=2),
    )
    body_para = Paragraph(body_html, BODY)
    tbl = Table(
        [[label_para], [body_para]],
        colWidths=[6.4 * inch],
    )
    tbl.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), bg),
                ("BOX", (0, 0), (-1, -1), 0.75, border),
                ("LEFTPADDING", (0, 0), (-1, -1), 14),
                ("RIGHTPADDING", (0, 0), (-1, -1), 14),
                ("TOPPADDING", (0, 0), (-1, -1), 10),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
            ]
        )
    )
    return tbl


def card(title, body_html):
    title_para = Paragraph(
        f"<b>{title}</b>",
        ParagraphStyle("CardTitle", parent=BODY, fontSize=11, leading=14, textColor=INK, spaceAfter=4),
    )
    body_para = Paragraph(body_html, BODY)
    tbl = Table([[title_para], [body_para]], colWidths=[6.4 * inch])
    tbl.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), colors.white),
                ("BOX", (0, 0), (-1, -1), 0.5, CREAM_LINE),
                ("LEFTPADDING", (0, 0), (-1, -1), 14),
                ("RIGHTPADDING", (0, 0), (-1, -1), 14),
                ("TOPPADDING", (0, 0), (-1, -1), 12),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
            ]
        )
    )
    return tbl


def hr():
    return HRFlowable(width="100%", thickness=0.5, color=CREAM_LINE, spaceBefore=4, spaceAfter=10)


def numbered(items):
    """Numbered list of paragraphs."""
    out = []
    for i, item in enumerate(items, 1):
        out.append(
            Paragraph(
                f"<font color='{BRAND.hexval()}'><b>{i}.</b></font>&nbsp;&nbsp;{item}",
                STEP,
            )
        )
    return out


def bulleted(items):
    out = []
    for item in items:
        out.append(
            Paragraph(
                f"<font color='{BRAND.hexval()}'>●</font>&nbsp;&nbsp;{item}",
                STEP,
            )
        )
    return out


def on_page(canvas, doc):
    canvas.saveState()
    # Header rule
    canvas.setStrokeColor(CREAM_LINE)
    canvas.setLineWidth(0.5)
    canvas.line(0.75 * inch, 10.65 * inch, 7.75 * inch, 10.65 * inch)
    # Brand tag top-left
    canvas.setFont("Helvetica-Bold", 9)
    canvas.setFillColor(BRAND)
    canvas.drawString(0.75 * inch, 10.78 * inch, "RIVER CITY CHURCH")
    canvas.setFont("Helvetica", 9)
    canvas.setFillColor(INK_MUTED)
    canvas.drawRightString(7.75 * inch, 10.78 * inch, "Editing & Publishing Guide")
    # Page number footer
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(INK_MUTED)
    canvas.drawCentredString(
        4.25 * inch, 0.5 * inch, f"Page {doc.page}"
    )
    canvas.restoreState()


def build():
    out_path = Path(__file__).parent.parent / "docs" / "editing-guide.pdf"
    out_path.parent.mkdir(parents=True, exist_ok=True)

    doc = SimpleDocTemplate(
        str(out_path),
        pagesize=LETTER,
        leftMargin=0.75 * inch,
        rightMargin=0.75 * inch,
        topMargin=1.05 * inch,
        bottomMargin=0.75 * inch,
        title="River City Church — Editing & Publishing Guide",
        author="River City Church",
    )

    story = []

    # ---------- COVER / QUICK REF ----------
    story.append(Paragraph("FOR THE RCC TEAM", EYEBROW))
    story.append(Paragraph("Editing &amp; Publishing the Website", TITLE))
    story.append(
        Paragraph(
            "A short, no-jargon guide to updating <b>rivercitymemphis.org</b>. "
            "If you can edit a Google Doc, you can do this.",
            SUBTITLE,
        )
    )
    story.append(hr())

    story.append(Paragraph("The two-step rhythm", H1))
    story.append(
        Paragraph(
            "Every change you make to the website follows the same pattern. "
            "<b>Edit</b> in one place, <b>publish</b> from another. That separation is on purpose — "
            "it gives you a chance to make several edits without anything going live until you say so.",
            BODY,
        )
    )
    story.append(Spacer(1, 8))

    story.append(
        callout(
            "EDIT HERE — Sanity Studio",
            "<b>rivercitymemphis.vercel.app/studio</b><br/>"
            "Where you change copy, swap images, add FAQ items, update service times.<br/>"
            "<i>Changes save automatically as drafts. Nothing goes live yet.</i>",
        )
    )
    story.append(Spacer(1, 8))
    story.append(
        callout(
            "PUBLISH HERE — Admin",
            "<b>rivercitymemphis.vercel.app/admin/publish</b><br/>"
            "Where you push your drafts live. One click per page.<br/>"
            "<i>Bookmark both URLs — you&apos;ll use them often.</i>",
            tone=ACCENT,
        )
    )
    story.append(Spacer(1, 14))

    story.append(Paragraph("Three steps, every time", H2))
    story.extend(
        numbered(
            [
                "Open <b>/studio</b>, find the page, make your changes (it auto-saves).",
                "Open <b>/admin/publish</b>, find the page in the list of pending drafts.",
                "Click <b>Publish</b>. The new version is live on the public site within about a minute.",
            ]
        )
    )

    story.append(PageBreak())

    # ---------- HOW TO EDIT ----------
    story.append(Paragraph("Step 1: How to Edit", H1))
    story.append(
        Paragraph(
            "Editing happens inside <b>Sanity Studio</b> — a friendly form-based editor for every page on the site.",
            BODY,
        )
    )
    story.append(Spacer(1, 6))

    story.append(Paragraph("Get in", H2))
    story.extend(
        numbered(
            [
                "Visit <b>rivercitymemphis.vercel.app/studio</b>",
                "Sign in with the Sanity account that David invited you with. "
                "(If you don&apos;t have one, ping David at <b>david.wilson@uadrinc.com</b>.)",
                "You&apos;ll land in the Studio. Look at the <b>left sidebar</b> — every editable page is listed there.",
            ]
        )
    )
    story.append(Spacer(1, 6))

    story.append(Paragraph("Find your page", H2))
    story.append(
        Paragraph(
            "The left sidebar shows everything that&apos;s editable. Some highlights:",
            BODY,
        )
    )
    story.extend(
        bulleted(
            [
                "<b>Site Settings</b> — address, phone, email, service time, social links, main menu",
                "<b>Home Page</b> — hero video, headline, current series block, kids &amp; students cards",
                "<b>Who We Are Page / What to Expect / Location Page / FAQ Page</b> — the Visit section",
                "<b>Connect Page / Next / Family Ministry / Be Rich / RCC Groups</b> — Connect &amp; Groups",
                "<b>Contact Page / Give Page</b> — the obvious ones",
                "<b>Leadership</b> — each pastor&apos;s photo, name, role, and bio",
                "<b>Sermon Series</b> — every series with its sermons inside",
                "<b>Events</b> — these come from Planning Center, so edit there, not here",
            ]
        )
    )
    story.append(Spacer(1, 6))

    story.append(Paragraph("Make your changes", H2))
    story.extend(
        numbered(
            [
                "Click the page you want to edit (e.g. <b>Home Page</b>).",
                "The page opens as a form with each section clearly labeled (Hero, Current Series, etc.).",
                "Edit any field — type new copy, drag a new photo in, change a button label.",
                "Sanity <b>auto-saves</b> as you go. An orange line next to a field means you&apos;ve changed it but it&apos;s still a draft.",
            ]
        )
    )
    story.append(Spacer(1, 6))

    story.append(
        callout(
            "WHAT YOU&apos;LL SEE",
            "At the top of the document you&apos;ll see two pills: a green <b>● Published</b> "
            "and an orange <b>● Draft</b>. Both showing means you have unsaved changes that haven&apos;t gone live yet. "
            "That&apos;s normal — head to <b>/admin/publish</b> when you&apos;re ready to push them. "
            "Changed your mind? Click the <b>···</b> three-dot menu in the top-right and pick <b>Discard changes</b>.",
        )
    )

    story.append(PageBreak())

    # ---------- HOW TO PUBLISH ----------
    story.append(Paragraph("Step 2: How to Publish", H1))
    story.append(
        Paragraph(
            "Once you&apos;ve made your edits in Studio, push them live from the admin page.",
            BODY,
        )
    )
    story.append(Spacer(1, 6))

    story.append(Paragraph("The publish flow", H2))
    story.extend(
        numbered(
            [
                "Visit <b>rivercitymemphis.vercel.app/admin/publish</b>",
                "Your browser will ask for a username and password. Use the credentials David shared with you. "
                "(Tick &quot;Remember&quot; if your browser offers it.)",
                "You&apos;ll see a list called <b>Publish Drafts</b>. Every page you&apos;ve edited but not yet published appears here.",
                "Find the page you want to push live and click its <b>Publish</b> button.",
                "Wait a second — the button changes to <b>Publishing…</b> and then <b>Published ✓</b>.",
                "Visit the public page (e.g. rivercitymemphis.org) to see your change. It usually shows up in under a minute.",
            ]
        )
    )
    story.append(Spacer(1, 6))

    story.append(
        callout(
            "GOOD TO KNOW",
            "You can publish multiple pages in one sitting — just click <b>Publish</b> on each. "
            "If nothing is in the list, that means there&apos;s nothing pending — either everything&apos;s already live or no one&apos;s made edits.",
        )
    )
    story.append(Spacer(1, 6))

    story.append(Paragraph("Refreshing the page", H2))
    story.append(
        Paragraph(
            "If you don&apos;t see your latest edit in the list, your browser may be holding a cached version of the admin page. "
            "Hard-refresh with <b>Cmd + Shift + R</b> (Mac) or <b>Ctrl + Shift + R</b> (Windows).",
            BODY,
        )
    )

    story.append(PageBreak())

    # ---------- COMMON TASKS ----------
    story.append(Paragraph("Common Tasks", H1))
    story.append(
        Paragraph(
            "Quick recipes for the things you&apos;ll do most often. All edits start in <b>/studio</b>; "
            "remember to head to <b>/admin/publish</b> when you&apos;re done.",
            BODY,
        )
    )
    story.append(Spacer(1, 8))

    story.append(
        card(
            "Swap the homepage hero video",
            "<b>Studio →</b> Home Page → Hero section → <b>Hero video</b> field. "
            "Drop in an MP4 (keep it under 10MB — compress with HandBrake first if needed). "
            "Also update the <b>Video poster image</b> just below so the still matches the new first frame. "
            "Leave the field empty to fall back to the original brand video.",
        )
    )
    story.append(Spacer(1, 8))

    story.append(
        card(
            "Update service times or address",
            "<b>Studio →</b> Site Settings. Edit <b>Service time</b>, <b>Address</b>, <b>Phone</b>, or <b>Email</b>. "
            "These flow through to the footer, the Location page, the contact page, and the SEO data Google reads.",
        )
    )
    story.append(Spacer(1, 8))

    story.append(
        card(
            "Add or edit a FAQ",
            "<b>Studio →</b> FAQ Page. Scroll to the <b>Items</b> list. Click <b>Add item</b> to create a new one "
            "or click an existing item to edit it. Each item has a <b>Question</b> and an <b>Answer</b> (rich text — "
            "you can add links, bold, headings).",
        )
    )
    story.append(Spacer(1, 8))

    story.append(
        card(
            "Update a leadership bio or photo",
            "<b>Studio →</b> Leadership. Pick a pastor. Update the photo (drag in a new one), the role, or the bio text. "
            "Display order on the live page is fixed: Jonathan → Eddie → Ken → Barrett.",
        )
    )
    story.append(Spacer(1, 8))

    story.append(
        card(
            "Post a new sermon",
            "<b>Studio →</b> Sermon Series. Either open an existing series and click <b>Add sermon</b>, "
            "or click <b>Create new document</b> to start a new series. Each sermon needs: <b>title, date, "
            "speaker, scripture, video platform (Vimeo or YouTube), video ID</b>. "
            "(The video ID is the part of the URL after the last slash — e.g. for vimeo.com/123456789 the ID is 123456789.)",
        )
    )
    story.append(Spacer(1, 8))

    story.append(
        card(
            "Change the menu / navigation",
            "<b>Studio →</b> Site Settings → <b>Main navigation</b>. Drag items to reorder. "
            "Click an item to rename it, change its link, or add submenu items. Both the desktop nav and the mobile hamburger pull from here.",
        )
    )
    story.append(Spacer(1, 8))

    story.append(
        card(
            "Update an event",
            "Events come from <b>Planning Center</b>, not Sanity. Edit the event there and the website picks it up automatically — "
            "no publishing needed. Inside Studio you can still toggle individual events as &quot;Show on site&quot; or &quot;Hide&quot; under the <b>Events</b> menu item.",
        )
    )

    story.append(PageBreak())

    # ---------- TIPS & TROUBLESHOOTING ----------
    story.append(Paragraph("Tips &amp; Troubleshooting", H1))
    story.append(Spacer(1, 4))

    story.append(Paragraph("My change didn&apos;t show up on the live site", H2))
    story.extend(
        bulleted(
            [
                "Did you publish it? Edits stay as drafts in Studio until you click <b>Publish</b> on <b>/admin/publish</b>.",
                "Did you wait ~60 seconds? The live site refreshes its cache periodically.",
                "Hard-refresh the public page: <b>Cmd + Shift + R</b> (Mac) or <b>Ctrl + Shift + R</b> (Windows).",
                "Still nothing? Open the page in a private/incognito window — your browser may be aggressively caching.",
            ]
        )
    )
    story.append(Spacer(1, 4))

    story.append(Paragraph("I don&apos;t see my draft on the admin page", H2))
    story.extend(
        bulleted(
            [
                "Make sure you actually edited a field in Studio (just opening the page doesn&apos;t create a draft).",
                "Hard-refresh the admin page.",
                "Check that you&apos;re logged into Studio as the same user who made the edit.",
            ]
        )
    )
    story.append(Spacer(1, 4))

    story.append(Paragraph("I uploaded a photo and it looks weird", H2))
    story.extend(
        bulleted(
            [
                "Most photo fields have a <b>hotspot</b> tool — click the photo and pick the most important point of focus (a face, an action). The crop on different screen sizes will keep that point in frame.",
                "For best quality: photos should be at least 1600px wide for hero images, 800px wide for cards.",
                "Don&apos;t worry about file format — JPG, PNG, and WebP all work.",
            ]
        )
    )
    story.append(Spacer(1, 4))

    story.append(Paragraph("I broke something / want to undo", H2))
    story.extend(
        bulleted(
            [
                "If you haven&apos;t published yet: in Studio, click the <b>···</b> three-dot menu → <b>Discard changes</b>. Live site stays unchanged.",
                "If you already published: re-edit the page back to what it was before, then publish again. Sanity also keeps a full <b>History</b> (three-dot menu → <b>History</b>) — you can view any past version and copy values from it.",
                "If something is truly stuck, text David.",
            ]
        )
    )
    story.append(Spacer(1, 4))

    story.append(Paragraph("Who can do what", H2))
    story.append(
        Paragraph(
            "Anyone with a Sanity account can edit. Anyone with the admin password can publish. "
            "Keep both circles to people you trust to ship changes to the live site without a second pair of eyes.",
            BODY,
        )
    )

    story.append(Spacer(1, 14))
    story.append(
        KeepTogether(
            [
                hr(),
                Paragraph(
                    "<b>Need help?</b> Text David Wilson at UAdr Inc. — david.wilson@uadrinc.com. "
                    "<font color='" + INK_MUTED.hexval() + "'>This guide lives in the project repo at <b>docs/editing-guide.pdf</b>.</font>",
                    BODY,
                ),
            ]
        )
    )

    doc.build(story, onFirstPage=on_page, onLaterPages=on_page)
    print(f"Wrote {out_path}")


if __name__ == "__main__":
    build()

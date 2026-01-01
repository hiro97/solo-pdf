export interface BlogPost {
  slug: string
  title: string
  description: string
  date: string
  readingTime: string
  tags: string[]
  content: string
}

export const blogPosts: BlogPost[] = [
  {
    slug: "why-local-pdf-editing-matters",
    title: "Why Local PDF Editing Matters for Privacy",
    description: "Learn why processing PDFs locally on your device is crucial for protecting sensitive information.",
    date: "2024-12-15",
    readingTime: "5 min read",
    tags: ["privacy", "security", "guide"],
    content: `# Why Local PDF Editing Matters for Privacy

## The Hidden Risks of Cloud Services

Many online PDF editing services require you to upload your files to their servers. This process creates several risks:

- Data breach vulnerability
- Third-party access possibilities
- Files may remain on servers indefinitely
- Network interception during transfer

## The Advantages of Local Processing

SOLO PDF performs all processing directly in your browser:

- Files are never uploaded
- Works offline
- Faster processing speeds
- Complete data control

## Conclusion

When handling sensitive documents, always choose local processing tools. Privacy is not optional—it's essential.`
  },
  {
    slug: "how-to-merge-pdf-files",
    title: "How to Merge PDF Files: Complete Guide",
    description: "Step-by-step guide to combining multiple PDF files into one document.",
    date: "2024-12-10",
    readingTime: "4 min read",
    tags: ["merge", "guide", "tutorial"],
    content: `# How to Merge PDF Files

## Why Merge PDFs?

Combining multiple documents into one makes management easier:

- Consolidate reports
- Organize contracts
- Create portfolios
- Simplify email attachments

## Merging with SOLO PDF

1. Open SOLO PDF editor
2. Select the PDF files to merge
3. Drag to adjust the order
4. Click the merge button
5. Download your new file

## Pro Tips

- Double-check file order beforehand
- Compress large files first
- Verify page numbers after merging`
  },
  {
    slug: "compress-pdf-without-quality-loss",
    title: "Compress PDF Without Quality Loss",
    description: "Learn techniques to reduce PDF file size while maintaining document quality.",
    date: "2024-12-05",
    readingTime: "6 min read",
    tags: ["compress", "optimization", "guide"],
    content: `# Compress PDF Without Quality Loss

## Why PDF Files Get Large

- High-resolution images
- Embedded fonts
- Unnecessary metadata
- Duplicate resources

## Compression Methods

### Image Optimization

Images are the main contributor to PDF size. Adjusting to appropriate resolution can significantly reduce file size.

### Font Subsetting

Including only the characters you use in fonts reduces file size.

### Metadata Cleanup

Removing unnecessary metadata saves some space.

## Benefits of Local Compression

SOLO PDF compresses in your browser, so even sensitive documents can be processed safely.`
  },
  {
    slug: "digital-signature-basics",
    title: "Digital Signature Basics for PDF Documents",
    description: "Understanding digital signatures and how to sign PDF documents securely.",
    date: "2024-11-28",
    readingTime: "7 min read",
    tags: ["signature", "security", "guide"],
    content: `# Digital Signature Basics for PDF Documents

## What is a Digital Signature?

A digital signature is an electronic method of proving document authenticity:

- Verifies signer identity
- Detects document modifications
- Can have legal validity

## Types of Signatures

### Electronic Signatures

Image or drawn signatures used for simple confirmations.

### Certified Digital Signatures

Encrypted signatures using certificates that provide higher security.

## SOLO PDF Signing

Sign locally so your signature image is never exposed externally. You can even draw directly on touch devices.`
  },
  {
    slug: "pdf-redaction-guide",
    title: "PDF Redaction: Properly Remove Sensitive Information",
    description: "Learn the difference between hiding and truly redacting information in PDFs.",
    date: "2024-11-20",
    readingTime: "8 min read",
    tags: ["redact", "security", "privacy"],
    content: `# PDF Redaction: Properly Remove Sensitive Information

## The Black Box Trap

Many people think covering text with black shapes makes it safe. This is a dangerous misconception.

## Overlay vs True Redaction

### Overlay Method (Dangerous)

- Places black shapes over text
- Original text still exists inside the PDF
- Can be extracted via copy-paste
- Some viewers can show hidden content

### True Redaction (Safe)

- Removes the original text data itself
- Cannot be recovered
- Requires specialized tools

## Important Note

SOLO PDF's redaction uses the overlay method. For complete security needs, use professional tools.`
  },
  {
    slug: "pdf-accessibility-tips",
    title: "Making Your PDFs Accessible",
    description: "Tips for creating PDFs that everyone can use, including people with disabilities.",
    date: "2024-11-15",
    readingTime: "5 min read",
    tags: ["accessibility", "guide", "best-practices"],
    content: `# Making Your PDFs Accessible

## Why Accessibility Matters

- Screen reader support for visually impaired users
- Legal compliance requirements
- Reach more users
- Improved SEO

## Accessibility Checklist

- Use proper heading structure
- Add alt text to images
- Ensure sufficient color contrast
- Set reading order
- Allow font size adjustment

## Pro Tip

Considering accessibility from the document creation stage is much easier than fixing it later.`
  },
  {
    slug: "pdf-form-filling-guide",
    title: "How to Fill PDF Forms Efficiently",
    description: "Guide to filling out PDF forms quickly and accurately.",
    date: "2024-11-08",
    readingTime: "4 min read",
    tags: ["forms", "guide", "productivity"],
    content: `# How to Fill PDF Forms Efficiently

## Types of PDF Forms

### Interactive Forms

- Forms with input fields
- Click to enter directly
- Data validation features

### Flat Forms

- Regular PDFs used as forms
- Requires text addition features
- Position adjustment needed

## Efficient Filling Tips

- Use Tab key to move between fields
- Keep frequently used info copied
- Save as you work
- Review after completion`
  },
  {
    slug: "batch-pdf-processing",
    title: "Batch Processing Multiple PDF Files",
    description: "Learn how to process multiple PDF files at once to save time.",
    date: "2024-10-30",
    readingTime: "5 min read",
    tags: ["productivity", "batch", "tutorial"],
    content: `# Batch Processing Multiple PDF Files

## When You Need Batch Processing

- Mass document conversion
- Compressing multiple files simultaneously
- Adding consistent watermarks
- Automating repetitive tasks

## SOLO PDF Batch Processing

You can select multiple files to process at once:

- Add files via drag and drop
- Set processing options for all
- Monitor progress in real-time
- Download all results at once

## Considerations

- Be mindful of browser memory limits
- Process too many files in batches
- Large files are best processed individually`
  },
  {
    slug: "pdf-security-best-practices",
    title: "PDF Security Best Practices",
    description: "Essential security practices when working with PDF documents.",
    date: "2024-10-22",
    readingTime: "6 min read",
    tags: ["security", "best-practices", "privacy"],
    content: `# PDF Security Best Practices

## Password Protection

### Open Password

Requires a password to open the document. Blocks unauthorized access.

### Permission Password

Restricts permissions like printing, copying, and editing. Set separately from open password.

## Safe Sharing

- Share only with necessary people
- Use encrypted channels when possible
- Review access permissions after sharing
- Redact sensitive info before sharing

## Metadata Management

PDFs contain metadata like author and modification history. Remove unnecessary metadata before sharing.`
  },
  {
    slug: "choosing-right-pdf-tool",
    title: "Choosing the Right PDF Tool for Your Needs",
    description: "How to choose between online, desktop, and local browser-based PDF tools.",
    date: "2024-10-15",
    readingTime: "5 min read",
    tags: ["comparison", "guide", "tools"],
    content: `# Choosing the Right PDF Tool for Your Needs

## Tool Type Comparison

### Online Services

Pros: No installation, access from anywhere
Cons: Requires file upload, privacy concerns

### Desktop Software

Pros: Powerful features, offline use
Cons: Requires installation, potential costs

### Local Browser-Based (SOLO PDF)

Pros: No installation, no file upload, free
Cons: Dependent on browser performance

## Selection Guide

- Sensitive documents: Local browser-based
- Professional editing: Desktop software
- Simple tasks: Choose based on situation

## Conclusion

Consider the balance between privacy and convenience. SOLO PDF can safely handle most common PDF tasks locally.`
  },
]

export function getAllPosts(): BlogPost[] {
  return blogPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug)
}

export function getAllTags(): string[] {
  const tags = new Set<string>()
  blogPosts.forEach((post) => post.tags.forEach((tag) => tags.add(tag)))
  return Array.from(tags).sort()
}

export function getPostsByTag(tag: string): BlogPost[] {
  return getAllPosts().filter((post) => post.tags.includes(tag))
}

export function searchPosts(query: string): BlogPost[] {
  const lowerQuery = query.toLowerCase()
  return getAllPosts().filter(
    (post) =>
      post.title.toLowerCase().includes(lowerQuery) ||
      post.description.toLowerCase().includes(lowerQuery) ||
      post.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  )
}

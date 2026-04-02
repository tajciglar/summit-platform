import { createStrapi } from '@strapi/strapi'

async function seed() {
  console.log('Starting seed...')

  const app = await createStrapi().load()

  try {
    // -------------------------------------------------------------------------
    // 1. Create admin user if none exists
    // -------------------------------------------------------------------------
    const adminCount = await strapi.db
      .query('admin::user')
      .count({})

    if (adminCount === 0) {
      console.log('Creating default admin user...')
      const adminUser = await strapi.db.query('admin::user').create({
        data: {
          firstname: 'Admin',
          lastname: 'User',
          email: 'admin@summit.local',
          password: await strapi.admin.services.auth.hashPassword('Admin1234!'),
          isActive: true,
          roles: [],
        },
      })

      // Assign super admin role
      const superAdminRole = await strapi.db
        .query('admin::role')
        .findOne({ where: { code: 'strapi-super-admin' } })

      if (superAdminRole) {
        await strapi.db.query('admin::user').update({
          where: { id: adminUser.id },
          data: { roles: [superAdminRole.id] },
        })
      }

      console.log('Admin user created: admin@summit.local / Admin1234!')
    } else {
      console.log('Admin user already exists, skipping.')
    }

    // -------------------------------------------------------------------------
    // 2. Create SummitSite: "Test Summit"
    // -------------------------------------------------------------------------
    const existingSite = await strapi.documents('api::summit-site.summit-site').findFirst({
      filters: { slug: 'test-summit' },
    })

    let summitSiteDocumentId: string

    if (!existingSite) {
      console.log('Creating summit site...')
      const summitSite = await strapi.documents('api::summit-site.summit-site').create({
        data: {
          name: 'Test Summit',
          slug: 'test-summit',
          domain: 'test.localhost',
          brand: {
            primaryColor: '#3B82F6',
            secondaryColor: '#1E40AF',
            fontHeading: 'Inter',
            fontBody: 'Inter',
          },
          globalSEO: {
            defaultTitle: 'Test Summit',
            defaultDescription: 'A test summit site',
            globalNoindex: false,
          },
          menus: [
            { label: 'Home', url: '/', openInNewTab: false },
            { label: 'Speakers', url: '/speakers', openInNewTab: false },
          ],
        },
        status: 'published',
      })
      summitSiteDocumentId = summitSite.documentId
      console.log(`Summit site created: ${summitSite.name} (documentId: ${summitSiteDocumentId})`)
    } else {
      summitSiteDocumentId = existingSite.documentId
      console.log('Summit site already exists, skipping.')
    }

    // -------------------------------------------------------------------------
    // 3. Create Product: "Summit All-Access Pass"
    // -------------------------------------------------------------------------
    const existingProduct = await strapi.documents('api::product.product').findFirst({
      filters: { slug: 'summit-all-access-pass' },
    })

    let productDocumentId: string

    if (!existingProduct) {
      console.log('Creating product...')
      const product = await strapi.documents('api::product.product').create({
        data: {
          name: 'Summit All-Access Pass',
          slug: 'summit-all-access-pass',
          description: 'Get lifetime access to all summit recordings, transcripts, and bonus materials.',
          type: 'one_time',
          price: 97,
          currency: 'eur',
          acTag: 'summit-optin',
          acProductTag: 'summit-buyer',
          summitSite: {
            documentId: summitSiteDocumentId,
          },
        },
        status: 'published',
      })
      productDocumentId = product.documentId
      console.log(`Product created: ${product.name} (documentId: ${productDocumentId})`)
    } else {
      productDocumentId = existingProduct.documentId
      console.log('Product already exists, skipping.')
    }

    // -------------------------------------------------------------------------
    // 4. Create Speaker: "Dr. Jane Smith"
    // -------------------------------------------------------------------------
    const existingSpeaker = await strapi.documents('api::speaker.speaker').findFirst({
      filters: { name: 'Dr. Jane Smith' },
    })

    if (!existingSpeaker) {
      console.log('Creating speaker...')
      const speaker = await strapi.documents('api::speaker.speaker').create({
        data: {
          name: 'Dr. Jane Smith',
          title: 'PhD, Child Psychologist',
          bio: 'Leading expert in child development and ADHD.',
          order: 1,
          summitSite: {
            documentId: summitSiteDocumentId,
          },
        },
        status: 'published',
      })
      console.log(`Speaker created: ${speaker.name} (documentId: ${speaker.documentId})`)
    } else {
      console.log('Speaker already exists, skipping.')
    }

    // -------------------------------------------------------------------------
    // 5. Create Funnel: "Main Launch Funnel"
    // -------------------------------------------------------------------------
    const existingFunnel = await strapi.documents('api::funnel.funnel').findFirst({
      filters: { slug: 'main-launch' },
    })

    let funnelDocumentId: string

    if (!existingFunnel) {
      console.log('Creating funnel...')
      const funnel = await strapi.documents('api::funnel.funnel').create({
        data: {
          name: 'Main Launch Funnel',
          slug: 'main-launch',
          status: 'active',
          summitSite: {
            documentId: summitSiteDocumentId,
          },
        },
        status: 'published',
      })
      funnelDocumentId = funnel.documentId
      console.log(`Funnel created: ${funnel.name} (documentId: ${funnelDocumentId})`)
    } else {
      funnelDocumentId = existingFunnel.documentId
      console.log('Funnel already exists, skipping.')
    }

    // -------------------------------------------------------------------------
    // 6. Create Funnel Steps
    // -------------------------------------------------------------------------
    const stepDefinitions = [
      {
        title: 'Free Summit Registration',
        slug: 'register',
        type: 'landing',
        order: 0,
        sections: [
          {
            __component: 'sections.hero',
            heading: 'Join the Free Summit',
            subheading: 'Reserve your free spot and get instant access to all sessions.',
            ctaText: 'Register for Free',
            ctaUrl: '#register',
            layout: 'centered',
          },
        ],
        products: [],
      },
      {
        title: 'Get All-Access Pass',
        slug: 'checkout',
        type: 'checkout',
        order: 1,
        sections: [],
        products: [{ documentId: productDocumentId }],
      },
      {
        title: 'Upgrade Your Experience',
        slug: 'upsell',
        type: 'upsell',
        order: 2,
        sections: [],
        products: [],
      },
      {
        title: "You're In!",
        slug: 'thank-you',
        type: 'thankyou',
        order: 3,
        sections: [],
        products: [],
      },
    ]

    for (const stepDef of stepDefinitions) {
      const existingStep = await strapi.documents('api::funnel-step.funnel-step').findFirst({
        filters: { slug: stepDef.slug, funnel: { documentId: funnelDocumentId } },
      })

      if (!existingStep) {
        console.log(`Creating funnel step: ${stepDef.title}...`)

        const stepData: Record<string, unknown> = {
          title: stepDef.title,
          slug: stepDef.slug,
          type: stepDef.type,
          order: stepDef.order,
          funnel: {
            documentId: funnelDocumentId,
          },
        }

        if (stepDef.sections && stepDef.sections.length > 0) {
          stepData.sections = stepDef.sections
        }

        if (stepDef.products && stepDef.products.length > 0) {
          stepData.products = stepDef.products
        }

        const step = await strapi.documents('api::funnel-step.funnel-step').create({
          data: stepData,
          status: 'published',
        })

        console.log(`Funnel step created: ${step.title} (documentId: ${step.documentId})`)
      } else {
        console.log(`Funnel step "${stepDef.title}" already exists, skipping.`)
      }
    }

    console.log('\nSeed completed successfully!')
  } catch (error) {
    console.error('Seed failed:', error)
    throw error
  } finally {
    await app.destroy()
  }
}

seed().catch((error) => {
  console.error(error)
  process.exit(1)
})

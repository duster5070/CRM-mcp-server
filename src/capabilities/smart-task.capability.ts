import { SmartTaskInput, AIContext } from "../types/ai.types.js";
import { AIPermissionsPolicy } from "../policies/ai-permissions.policy.js";

export class SmartTaskCapability {
  static async suggestTasks(context: AIContext, input: SmartTaskInput) {
    if (!AIPermissionsPolicy.canGenerateContent(context)) {
      return "ACCESS_DENIED: You do not have permission to generate AI task suggestions.";
    }
    const description = input.projectDescription.toLowerCase();
    
    // 1. Define Industry Blueprints
    const blueprints = [
      {
        keywords: ['saas', 'web app', 'platform', 'dashboard'],
        modules: [
          { name: "User Auth & Security", tasks: ["JWT Implementation", "RBAC Logic", "Password Reset Flow"] },
          { name: "Core API", tasks: ["CRUD for Resources", "Filtering & Sorting", "Rate Limiting"] },
          { name: "Frontend Setup", tasks: ["Design System", "Main Dashboard", "Responsive Layout"] }
        ]
      },
      {
        keywords: ['mobile', 'ios', 'android', 'app'],
        modules: [
          { name: "Mobile UI", tasks: ["Navigation Stack", "Onboarding Screens", "Theming"] },
          { name: "Device Features", tasks: ["Push Notifications", "Biometrics", "Camera Integration"] },
          { name: "Store Prep", tasks: ["App Icon", "Splashed Screens", "Privacy Policy"] }
        ]
      },
      {
        keywords: ['seo', 'marketing', 'content'],
        modules: [
          { name: "On-Page SEO", tasks: ["Meta Tags Optimization", "Sitemap Generation", "Schema Markup"] },
          { name: "Analytics", tasks: ["GTM Setup", "Conversion Tracking", "Search Console Link"] },
          { name: "Performance", tasks: ["Image Optimization", "Caching Strategy", "LCP Improvements"] }
        ]
      }
    ];

    // 2. Select the best blueprint
    const selectedBlueprint = blueprints.find(b => 
      b.keywords.some(k => description.includes(k))
    ) || blueprints[0]; // Default to SaaS if no match

    // 3. Filter by requested moduleCount
    const finalModules = selectedBlueprint.modules.slice(0, input.moduleCount || 3);

    return finalModules;
  }
}

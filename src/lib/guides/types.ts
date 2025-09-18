export type GuideContent = {
  type: 'list' | 'visual-sample' | 'before-after' | 'paragraph-example';
  items?: string[];
  text?: string;
  before?: string;
  after?: string;
};

export type GuideItem = {
  title: string;
  content: GuideContent;
};

export type UniversityGuide = {
  school: string;
  slug: string;
  studentDashboard: {
    icon: string;
    title: string;
    items: GuideItem[];
  };
  advisorDashboard: {
    icon: string;
    title: string;
    items: GuideItem[];
  };
};
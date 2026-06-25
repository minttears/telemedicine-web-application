type LegalSection = {
  body: string;
  title: string;
};

type LegalPageProps = {
  description: string;
  sections: LegalSection[];
  title: string;
};

export function LegalPage({ description, sections, title }: LegalPageProps) {
  return (
    <main className="bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <article className="mx-auto max-w-3xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-medium text-teal-700">
          Правовая информация
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal text-slate-950">
          {title}
        </h1>
        <p className="mt-4 text-sm leading-6 text-slate-600">{description}</p>

        <div className="mt-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm leading-6 text-amber-900">
            Это демонстрационный правовой текст для проверки MVP-продукта. Он
            не является юридической консультацией и должен быть проверен
            квалифицированным юристом до реального запуска или работы с
            данными реальных пациентов.
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-lg font-semibold text-slate-950">
                {section.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {section.body}
              </p>
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}

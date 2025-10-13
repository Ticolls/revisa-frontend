import { Upload, Download, FolderOpen } from "lucide-react"
import { Card } from "@/components/ui/card"

const features = [
  {
    icon: Upload,
    title: "Compartilhe materiais",
    description:
      "Faça upload de suas anotações, resumos, listas de exercícios e outros materiais para ajudar seus colegas.",
  },
  {
    icon: Download,
    title: "Acesse conteúdos",
    description: "Baixe materiais compartilhados por outros estudantes e tenha acesso a diversos recursos de estudo.",
  },
  {
    icon: FolderOpen,
    title: "Organizado por matéria",
    description:
      "Todos os materiais são organizados por disciplina, facilitando a busca pelo conteúdo que você precisa.",
  },
]

export function Features() {
  return (
    <section id="features" className="py-16 sm:py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 text-balance">Como funciona</h2>
          <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
            Uma plataforma simples e eficiente para compartilhar conhecimento entre estudantes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card key={index} className="p-6 sm:p-8 hover:shadow-lg transition-shadow border-border bg-card">
                <div className="mb-4 inline-flex items-center justify-center size-12 rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-6" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}

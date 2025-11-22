import { MessageCircle, Upload, BookCheck, Download, FileText, ScrollText, Component, Book } from "lucide-react"
import { Card } from "@/components/ui/card"

const features = [
  {
    icon: MessageCircle,
    title: "Solicite materiais",
    description:
      "Faça uma solicitação descrevendo o material que você precisa. Nossa comunidade está pronta para ajudar compartilhando conteúdos relevantes.",
    items: [
      "Descreva o que precisa",
      "Receba ajuda da comunidade",
      "Acesse conteúdos relevantes"
    ]
  },
  {
    icon: Upload,
    title: "Ajude outros alunos",
    description: 
      "Encontre solicitações de materiais que você possa ajudar e faça upload dos seus materiais de estudo para contribuir com a comunidade.",
    items: [
      "Compartilhe seus materiais",
      "Contribua com a comunidade",
      "Ajude outros estudantes"
    ]
  },
  {
    icon: BookCheck,
    title: "Navegue por disciplinas",
    description:
      "Explore materiais organizados por disciplina, faça download dos conteúdos e encontre exatamente o que precisa para seus estudos.",
    items: [
      "Conteúdo organizado",
      "Busca simplificada",
      "Fácil navegação"
    ]
  },
  {
    icon: Download,
    title: "Acesse diversos conteúdos",
    description:
      "Faça download de uma variedade de materiais de estudo disponibilizados pela comunidade para auxiliar no seu aprendizado.",
    items: [
      { text: "Provas antigas e simulados", icon: ScrollText },
      { text: "Listas de exercícios", icon: FileText },
      { text: "Slides e apresentações", icon: Component },
      { text: "Resumos e anotações", icon: Book }
    ]
  }
]

export function Features() {
  return (
    <section id="features" className="py-16 sm:py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 text-balance">Como funciona</h2>
          <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
            Uma comunidade colaborativa onde estudantes se ajudam compartilhando materiais de estudo
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card key={index} className="group relative overflow-hidden p-6 sm:p-8 hover:shadow-xl transition-all duration-300 border-border bg-card hover:bg-accent/5">
                <div className="absolute top-0 right-0 w-32 h-32 -translate-y-16 translate-x-16 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors duration-300" />
                
                <div className="relative space-y-4">
                  <div className="inline-flex items-center justify-center size-14 rounded-xl bg-primary/10 text-primary ring-8 ring-primary/5 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                    <Icon className="size-7" />
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed mb-4">{feature.description}</p>
                  </div>

                  <div className="space-y-2">
                    {feature.items && feature.items.map((item, itemIndex) => (
                      typeof item === 'string' ? (
                        <div key={itemIndex} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="size-1.5 rounded-full bg-primary" />
                          {item}
                        </div>
                      ) : (
                        <div key={itemIndex} className="flex items-center gap-3 text-sm text-muted-foreground">
                          <item.icon className="size-4 text-primary" />
                          {item.text}
                        </div>
                      )
                    ))}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}

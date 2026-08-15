from django.views.generic import TemplateView


class SpaView(TemplateView):
    """Single shell page; JavaScript owns all UI routing and rendering."""

    template_name = "spa.html"

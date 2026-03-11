from pydantic import BaseModel, Field


class QuoteData(BaseModel):
    # Personal
    first_name: str = Field(default="", alias="first-name")
    last_name:  str = Field(default="", alias="last-name")
    email:      str = ""
    phone:      str = ""
    dob:        str = ""
    state:      str = ""
    # Vehicle
    vehicle_year:  str = Field(default="", alias="vehicle-year")
    vehicle_make:  str = Field(default="", alias="vehicle-make")
    vehicle_model: str = Field(default="", alias="vehicle-model")
    # Coverage
    coverage_type: str = Field(default="", alias="coverage-type")
    deductible:    str = ""

    model_config = {"populate_by_name": True}


class AgentRequest(BaseModel):
    message: str
    formData: QuoteData
